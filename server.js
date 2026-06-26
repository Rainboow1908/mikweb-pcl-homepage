/**
 * MikWeb PCL 主页服务器
 *
 * 用法:
 *   node server.js
 *   然后在 PCL 中设置: 设置 → 个性化 → 主页 → 联网更新地址:
 *   http://localhost:38080/pcl-homepage.xaml
 *
 * 环境变量 (可选):
 *   PORT          - 监听端口 (默认 38080)
 *   API_BASE      - MikWeb API 地址 (默认 https://mcmik.top/api)
 *   SERVER_ADDR   - MC 服务器地址 (默认 noctiro.moe)
 *   VERSION       - 2026.06.21
 */

import http from "node:http";
import https from "node:https";

const PORT = parseInt(process.env.PORT || "38080", 10);
const API_BASE = process.env.API_BASE || "https://mcmik.top/api";
const SERVER_ADDR = process.env.SERVER_ADDR || "noctiro.moe";

// ── 工具: JSON fetch + 缓存 ──────────────────────────────────────

const API_TIMEOUT = 5000; // 单个 API 最多等 5 秒

/** GET JSON from the MikWeb API. */
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, { timeout: API_TIMEOUT }, (res) => {
      // 非 2xx 也算失败，不存缓存
      if (res.statusCode < 200 || res.statusCode >= 300) {
        req.destroy();
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          reject(new Error(`Invalid JSON: ${body.slice(0, 200)}`));
        }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("timeout"));
    });
  });
}

// 内存缓存：存上次成功的数据，API 挂掉时用
const cache = new Map();

/** 带缓存的数据获取：成功时更新缓存，失败时用旧数据 */
async function fetchWithCache(key, url, fallback) {
  try {
    const data = await fetchJSON(url);
    cache.set(key, { data, time: Date.now() });
    return data;
  } catch (e) {
    const stale = cache.get(key);
    if (stale) {
      console.log(`[cache] ${key} 使用缓存 (${Math.round((Date.now() - stale.time) / 1000)}s 前)`);
      return stale.data;
    }
    console.log(`[cache] ${key} 无缓存，API 失败: ${e.message}`);
    return fallback;
  }
}

// ── 数据获取 ─────────────────────────────────────────────────────

async function getOnlinePlayers() {
  const data = await fetchWithCache(
    "online",
    `${API_BASE}/players/online`,
    { online: -1, players: [] },
  );
  return data;
}

async function getAnnouncements(count = 5) {
  const list = await fetchWithCache("announcements", `${API_BASE}/announcements`, []);
  return Array.isArray(list) ? list.slice(0, count) : [];
}

async function getHistorySummary() {
  const data = await fetchWithCache("history", `${API_BASE}/players/history`, null);
  return data?.summary || null;
}

async function getBuildingCount() {
  const list = await fetchWithCache("buildings", `${API_BASE}/buildings`, null);
  return Array.isArray(list) ? list.length : null;
}

async function getBans() {
  const list = await fetchWithCache("bans", `${API_BASE}/bans`, null);
  return Array.isArray(list) ? list : null;
}

// ── 工具: XAML 转义 ──────────────────────────────────────────────

const ESC = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

function esc(str) {
  return String(str).replace(/[&<>"]/g, (c) => ESC[c]);
}

// ── 时间格式 ─────────────────────────────────────────────────────

function fmtTime(iso) {
  try {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return iso;
  }
}

// ── XAML 生成 ─────────────────────────────────────────────────────
//
// 格式参考 PCL 官方 Custom.xaml 模板:
//   - 无 XML 声明 / 根元素，卡片直接并列
//   - PCL 自动声明 xmlns / xmlns:local 等命名空间
//   - 文本控件用 WPF 内置 TextBlock，非 local:MyTextBlock
//   - local:MyCard 用 Title 而非 Header
//   - local:MyIconTextButton 的 Logo 需要 SVG Path，不能用 font icon

async function buildXAML() {
  // Promise.allSettled: 某个 API 502 不影响其他 API 的结果
  const results = await Promise.allSettled([
    getOnlinePlayers(),
    getAnnouncements(5),
    getHistorySummary(),
    getBuildingCount(),
    getBans(),
  ]);

  const players   = results[0].status === "fulfilled" ? results[0].value : { online: -1, players: [] };
  const anns      = results[1].status === "fulfilled" ? results[1].value : [];
  const summary   = results[2].status === "fulfilled" ? results[2].value : null;
  const buildingCount = results[3].status === "fulfilled" ? results[3].value : null;
  const bans      = results[4].status === "fulfilled" ? results[4].value : null;

  const online = players.online ?? -1;
  const playerList = players.players ?? [];

  // 在线状态文字和颜色
  let statusText, statusColor;
  if (online === -1) {
    statusText = "服务器离线";
    statusColor = "#FF5555";
  } else if (online === 0) {
    statusText = "无人在线";
    statusColor = "#FFAA00";
  } else {
    statusText = `${online} 人在线`;
    statusColor = "#2ECC40";
  }

  // ── 独立可折叠卡片 ──

  // 在线玩家
  let playerCard = "";
  if (playerList.length > 0) {
    const rows = playerList
      .slice(0, 12)
      .map(
        (p) =>
          `            <TextBlock TextWrapping="Wrap" Margin="0,0,0,2"
                       Text="${esc(p.name)}  ·  上线于 ${esc(fmtTime(p.joined_at))}" />`,
      )
      .join("\n");
    playerCard = `<local:MyCard Title="在线玩家 (${playerList.length})" Margin="0,0,0,15" CanSwap="True" IsSwapped="False">
    <StackPanel Margin="25,40,23,15">
${rows}
    </StackPanel>
</local:MyCard>`;
  } else {
    playerCard = `<local:MyCard Title="在线玩家" Margin="0,0,0,15" CanSwap="True">
    <StackPanel Margin="25,40,23,15">
        <TextBlock TextWrapping="Wrap"
                   Text="${online > 0 ? "已获取在线人数，但暂无详细玩家列表" : "暂无玩家在线"}" />
    </StackPanel>
</local:MyCard>`;
  }

  // 公告
  let annCard = "";
  if (anns.length > 0) {
    const items = anns
      .map(
        (a, i) =>
          `            <StackPanel Margin="0,${i > 0 ? "10" : "0"},0,0">
                <TextBlock TextWrapping="Wrap" Margin="0,0,0,2"
                           Text="${esc(a.content || "")}" />
                <TextBlock TextWrapping="Wrap" FontSize="11" Foreground="#888888"
                           Text="${esc(fmtTime(a.timestamp))}" />
            </StackPanel>`,
      )
      .join("\n");
    annCard = `<local:MyCard Title="公告 (${anns.length})" Margin="0,0,0,15" CanSwap="True" IsSwapped="False">
    <StackPanel Margin="25,40,23,15">
${items}
    </StackPanel>
</local:MyCard>`;
  } else {
    annCard = `<local:MyCard Title="公告" Margin="0,0,0,15" CanSwap="True">
    <StackPanel Margin="25,40,23,15">
        <TextBlock TextWrapping="Wrap" Text="暂无公告" />
    </StackPanel>
</local:MyCard>`;
  }

  // 封禁列表
  let banCard = "";
  if (bans && bans.length > 0) {
    const items = bans
      .map(
        (b, i) =>
          `            <StackPanel Margin="0,${i > 0 ? "10" : "0"},0,0">
                <TextBlock TextWrapping="Wrap" FontWeight="Bold" Margin="0,0,0,2"
                           Text="${esc(b.playerName || "?")}" />
                <TextBlock TextWrapping="Wrap" Margin="0,0,0,1"
                           Text="原因：${esc(b.reason || "无")}" />
                <TextBlock TextWrapping="Wrap" Margin="0,0,0,1" FontSize="11" Foreground="#888888"
                           Text="执行者：${esc(b.bannedBy || "?")}  ·  ${esc(fmtTime(b.bannedAt))}" />
                <TextBlock TextWrapping="Wrap" FontSize="11" Foreground="${b.isPermanent ? "#FF5555" : "#FFAA00"}"
                           Text="${b.isPermanent ? "永久封禁" : "过期时间：" + esc(fmtTime(b.expiresAt || "?"))}" />
            </StackPanel>`,
      )
      .join("\n");
    banCard = `<local:MyCard Title="封禁列表 (${bans.length})" Margin="0,0,0,15" CanSwap="True" IsSwapped="False">
    <StackPanel Margin="25,40,23,15">
${items}
    </StackPanel>
</local:MyCard>`;
  } else {
    banCard = `<local:MyCard Title="封禁列表" Margin="0,0,0,15" CanSwap="True">
    <StackPanel Margin="25,40,23,15">
        <TextBlock TextWrapping="Wrap" Text="暂无封禁记录" />
    </StackPanel>
</local:MyCard>`;
  }

  // 数据摘要（历史 + 建筑）
  let summaryCard = "";
  const sp = [];
  if (summary) {
    if (summary.peak_online != null) sp.push(`📈 历史峰值：${summary.peak_online} 人`);
    if (summary.avg_online != null) sp.push(`📊 平均在线：${Number(summary.avg_online).toFixed(1)} 人`);
    if (summary.total_unique_players != null) sp.push(`👥 独立玩家：${summary.total_unique_players} 人`);
  }
  if (buildingCount != null) sp.push(`🏗️ 建筑作品：${buildingCount} 个`);

  if (sp.length > 0) {
    summaryCard = `<local:MyCard Title="服务器数据" Margin="0,0,0,15" CanSwap="True" IsSwapped="False">
    <StackPanel Margin="25,40,23,15">
        <TextBlock TextWrapping="Wrap" Text="${esc(sp.join("  ·  "))}" />
    </StackPanel>
</local:MyCard>`;
  } else {
    summaryCard = `<local:MyCard Title="服务器数据" Margin="0,0,0,15" CanSwap="True">
    <StackPanel Margin="25,40,23,15">
        <TextBlock TextWrapping="Wrap" Text="暂无法获取统计数据" />
    </StackPanel>
</local:MyCard>`;
  }

  // 启动游戏按钮 — 用 \current 表示当前选中的 MC 版本，自动加入服务器
  const launchBtn = `<local:MyButton Margin="0,0,0,0" Width="190" Height="36" Padding="20,0,20,0" ColorType="Highlight"
                        Text="🚀 启动游戏并加入服务器" EventType="启动游戏" EventData="\\current|${esc(SERVER_ADDR)}"
                        ToolTip="使用当前选中的 Minecraft 版本启动，并自动进入 ${esc(SERVER_ADDR)}" />`;

  return `<local:MyCard Title="Mik Casual 服务器状态" Margin="0,0,0,15" CanSwap="True" IsSwapped="False">
    <StackPanel Margin="25,40,23,15">
        <StackPanel Orientation="Horizontal" Margin="0,0,0,8">
            <TextBlock Text="●" FontSize="14" Foreground="${esc(statusColor)}" Margin="0,0,6,0" VerticalAlignment="Center" />
            <TextBlock Text="${esc(statusText)}" FontSize="16" Foreground="${esc(statusColor)}" VerticalAlignment="Center" />
            <TextBlock Text="   ${esc(SERVER_ADDR)}" FontSize="13" Foreground="#888888" VerticalAlignment="Center" Margin="8,0,0,0" />
        </StackPanel>
        <local:MyHint Text="点击下方按钮即可一键启动游戏并加入服务器！" Theme="Blue" Margin="0,0,0,12" />
        <StackPanel HorizontalAlignment="Center" Orientation="Horizontal">
            <local:MyButton Margin="0,0,10,0" Width="90" Height="36" Padding="13,0,13,0"
                        Text="刷新" EventType="刷新主页" />
            ${launchBtn}
        </StackPanel>
        <TextBlock TextWrapping="Wrap" TextAlignment="Center" Foreground="#CCAA55" FontSize="12" Margin="0,14,0,0"
                   Text="腐竹辛苦啦！考完就是胜利——分数锁不住你的世界线，前方还有大片未探索的区域。" />
    </StackPanel>
</local:MyCard>

${playerCard}
${annCard}
${banCard}
${summaryCard}

<local:MyCard Title="网页入口" Margin="0,0,0,15" CanSwap="True" IsSwapped="True">
    <StackPanel Margin="25,40,23,15">
        <TextBlock TextWrapping="Wrap" Margin="0,0,0,8"
                   Text="以下入口将在浏览器中打开对应页面。" />
        <local:MyListItem Margin="-5,2,-5,5"
                          Title="建筑展示" Info="查看所有建筑作品详情"
                          EventType="打开网页" EventData="https://mcmik.top/buildings" Type="Clickable" />
        <local:MyListItem Margin="-5,2,-5,5"
                          Title="Wiki" Info="服务器帮助文档"
                          EventType="打开网页" EventData="https://mcmik.top/wiki" Type="Clickable" />
    </StackPanel>
</local:MyCard>

<local:MyCard Title="关于" Margin="0,0,0,15" CanSwap="True" IsSwapped="True">
    <StackPanel Margin="25,40,23,10">
        <TextBlock TextWrapping="Wrap" Margin="0,0,0,6"
                   Text="Mik Casual 是一个 Minecraft 生存服务器。本主页通过 MikWeb API 实时获取服务器数据。" />
        <TextBlock TextWrapping="Wrap" FontSize="11" Foreground="#666666" HorizontalAlignment="Center" Margin="0,10,0,0"
                   Text="更新时间: {time}  ·  PCL {pcl_version}  ·  Powered by MikWeb" />
    </StackPanel>
</local:MyCard>`;
}

// ── HTTP 服务器 ───────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "GET" && req.url === "/pcl-homepage.xaml") {
    try {
      const xaml = await buildXAML();
      res.writeHead(200, {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=5",
      });
      res.end(xaml);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(`Error generating homepage: ${err.message}`);
    }
    return;
  }

  // 健康检查
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, api: API_BASE }));
    return;
  }

  // 根路径 - 提示信息
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(`<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>MikWeb PCL 主页</title>
<style>body{font-family:system-ui,sans-serif;max-width:640px;margin:40px auto;padding:0 20px;background:#1a1a2e;color:#ddd}
code{background:#333;padding:2px 6px;border-radius:3px}a{color:#7af}</style></head>
<body>
<h1>🎮 MikWeb PCL 主页服务器</h1>
<p>在 PCL 启动器中设置主页地址:</p>
<p><code>http://localhost:${PORT}/pcl-homepage.xaml</code></p>
<p>设置路径: <strong>设置 → 个性化 → 主页 → 联网更新的下载地址</strong></p>
<hr>
<p>API 基址: <code>${API_BASE}</code></p>
<p><a href="/pcl-homepage.xaml">→ 预览 XAML</a></p>
</body></html>`);
});

server.listen(PORT, () => {
  console.log(`✅ MikWeb PCL 主页服务器已启动`);
  console.log(`   PCL 主页地址: http://localhost:${PORT}/pcl-homepage.xaml`);
  console.log(`   API 基址:    ${API_BASE}`);
  console.log(`   健康检查:    http://localhost:${PORT}/health`);
});
