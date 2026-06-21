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
 *   API_BASE      - MikWeb API 地址 (默认 https://mik.noctiro.moe/api)
 *   SERVER_ADDR   - MC 服务器地址 (默认 mik.noctiro.moe)
 */

import http from "node:http";
import https from "node:https";

const PORT = parseInt(process.env.PORT || "38080", 10);
const API_BASE = process.env.API_BASE || "https://mik.noctiro.moe/api";
const SERVER_ADDR = process.env.SERVER_ADDR || "mik.noctiro.moe";

// ── 工具: JSON fetch ──────────────────────────────────────────────

/** GET JSON from the MikWeb API (handles both http and https). */
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    mod
      .get(url, { timeout: 8000 }, (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            reject(new Error(`Invalid JSON: ${body.slice(0, 200)}`));
          }
        });
      })
      .on("error", reject)
      .on("timeout", function () {
        this.destroy();
        reject(new Error("Request timeout"));
      });
  });
}

// ── 数据获取 ─────────────────────────────────────────────────────

async function getOnlinePlayers() {
  try {
    const data = await fetchJSON(`${API_BASE}/players/online`);
    return data;
  } catch (e) {
    return { online: -1, players: [], error: e.message };
  }
}

async function getAnnouncements(count = 5) {
  try {
    const list = await fetchJSON(`${API_BASE}/announcements`);
    return Array.isArray(list) ? list.slice(0, count) : [];
  } catch {
    return [];
  }
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
  const [players, anns] = await Promise.all([
    getOnlinePlayers(),
    getAnnouncements(5),
  ]);

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
    statusColor = "#55FF55";
  }

  // 公告卡片
  let annCards = "";
  if (anns.length > 0) {
    annCards = anns
      .map(
        (a, i) =>
          `<local:MyCard Title="公告 ${i + 1}" Margin="0,0,0,10" CanSwap="True">
    <StackPanel Margin="25,15,23,15">
        <TextBlock TextWrapping="Wrap" Margin="0,0,0,4"
                   Text="${esc(a.content || "")}" />
        <TextBlock TextWrapping="Wrap" FontSize="11" Foreground="#888888"
                   Text="${esc(fmtTime(a.timestamp))}" />
    </StackPanel>
</local:MyCard>`,
      )
      .join("\n");
  } else {
    annCards = `<local:MyCard Title="公告" Margin="0,0,0,10" CanSwap="True">
    <StackPanel Margin="25,15,23,15">
        <TextBlock TextWrapping="Wrap" Text="暂无公告" Foreground="#888888" />
    </StackPanel>
</local:MyCard>`;
  }

  // 在线玩家列表
  let playerRows = "";
  if (playerList.length > 0) {
    playerRows = playerList
      .slice(0, 12)
      .map(
        (p) =>
          `        <TextBlock TextWrapping="Wrap" Margin="0,0,0,2"
                   Text="${esc(p.name)}  ·  上线于 ${esc(fmtTime(p.joined_at))}" />`,
      )
      .join("\n");
  } else {
    playerRows = `        <TextBlock TextWrapping="Wrap"
                   Text="${online > 0 ? "已获取在线人数，但暂无详细玩家列表" : "暂无玩家在线"}" />`;
  }

  // 启动游戏按钮 — 用 \current 表示当前选中的 MC 版本，自动加入服务器
  const launchBtn = `<local:MyButton Margin="0,0,0,0" Width="260" Height="42" Padding="20,0,20,0" ColorType="Highlight"
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
        <StackPanel HorizontalAlignment="Center">
            ${launchBtn}
        </StackPanel>
        <StackPanel Orientation="Horizontal" HorizontalAlignment="Center" Margin="0,12,0,0">
            <local:MyButton Margin="0,0,10,0" Width="90" Height="35" Padding="13,0,13,0"
                        Text="刷新" EventType="刷新主页" />
            <local:MyButton Margin="0,0,10,0" Width="90" Height="35" Padding="13,0,13,0"
                        Text="复制 IP" EventType="复制文本" EventData="${esc(SERVER_ADDR)}" />
        </StackPanel>
    </StackPanel>
</local:MyCard>

<local:MyCard Title="在线玩家" Margin="0,0,0,15" CanSwap="True" IsSwapped="False">
    <StackPanel Margin="25,40,23,15">
${playerRows}
    </StackPanel>
</local:MyCard>

${annCards}

<local:MyCard Title="更多" Margin="0,0,0,15" CanSwap="True" IsSwapped="True">
    <StackPanel Margin="25,40,23,15">
        <TextBlock TextWrapping="Wrap" Margin="0,0,0,8"
                   Text="以下入口将在浏览器中打开对应页面。" />
        <local:MyListItem Margin="-5,2,-5,5"
                          Title="建筑展示" Info="查看服务器建筑作品"
                          EventType="打开网页" EventData="https://mik.noctiro.moe/buildings" Type="Clickable" />
        <local:MyListItem Margin="-5,2,-5,5"
                          Title="封禁列表" Info="查看当前封禁记录"
                          EventType="打开网页" EventData="https://mik.noctiro.moe/bans" Type="Clickable" />
        <local:MyListItem Margin="-5,2,-5,5"
                          Title="Wiki" Info="服务器帮助文档"
                          EventType="打开网页" EventData="https://mik.noctiro.moe/wiki" Type="Clickable" />
        <local:MyListItem Margin="-5,2,-5,5"
                          Title="在线人数历史" Info="查看历史在线人数曲线"
                          EventType="打开网页" EventData="https://mik.noctiro.moe/players/history" Type="Clickable" />
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
        "Cache-Control": "public, max-age=60",
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
