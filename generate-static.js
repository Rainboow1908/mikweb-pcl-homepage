/**
 * GitHub Actions 用：拉 MikWeb API → 生成 Custom.xaml → 写入文件
 * 由 .github/workflows/update.yml 定时触发
 */
import https from "node:https";
import http from "node:http";
import fs from "node:fs";

const API_BASE = "https://mik.noctiro.moe/api";
const SERVER_ADDR = "noctiro.moe";

// ── fetch ──
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, { timeout: 10000 }, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        req.destroy();
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => {
        try { resolve(JSON.parse(body)); }
        catch { reject(new Error("invalid JSON")); }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
  });
}

// ── data ──
async function getOnlinePlayers() {
  try { return await fetchJSON(`${API_BASE}/players/online`); }
  catch { return { online: -1, players: [] }; }
}
async function getAnnouncements(n = 5) {
  try { const list = await fetchJSON(`${API_BASE}/announcements`); return Array.isArray(list) ? list.slice(0, n) : []; }
  catch { return []; }
}
async function getHistorySummary() {
  try { const data = await fetchJSON(`${API_BASE}/players/history`); return data?.summary || null; }
  catch { return null; }
}
async function getBuildingCount() {
  try { const list = await fetchJSON(`${API_BASE}/buildings`); return Array.isArray(list) ? list.length : null; }
  catch { return null; }
}
async function getBans() {
  try { const list = await fetchJSON(`${API_BASE}/bans`); return Array.isArray(list) ? list : null; }
  catch { return null; }
}

// ── helpers ──
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c])); }
function fmtTime(iso) {
  try { const d = new Date(iso); const p = n => String(n).padStart(2,"0"); return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${p(d.getHours())}:${p(d.getMinutes())}`; }
  catch { return iso; }
}

// ── build ──
async function build() {
  const [players, anns, summary, buildingCount, bans] = await Promise.allSettled([
    getOnlinePlayers(), getAnnouncements(5), getHistorySummary(), getBuildingCount(), getBans(),
  ]);
  const p  = players.status === "fulfilled" ? players.value : { online: -1, players: [] };
  const a  = anns.status === "fulfilled" ? anns.value : [];
  const sm = summary.status === "fulfilled" ? summary.value : null;
  const bc = buildingCount.status === "fulfilled" ? buildingCount.value : null;
  const bn = bans.status === "fulfilled" ? bans.value : null;

  const online = p.online ?? -1;
  const playerList = p.players ?? [];
  let st, sc;
  if (online === -1) { st = "服务器离线"; sc = "#FF5555"; }
  else if (online === 0) { st = "无人在线"; sc = "#FFAA00"; }
  else { st = `${online} 人在线`; sc = "#55FF55"; }

  // 在线玩家
  let playerCard;
  if (playerList.length > 0) {
    const rows = playerList.slice(0,12).map(pl => `            <TextBlock TextWrapping="Wrap" Margin="0,0,0,2"
                       Text="${esc(pl.name)}  ·  上线于 ${esc(fmtTime(pl.joined_at))}" />`).join("\n");
    playerCard = `<local:MyCard Title="在线玩家 (${playerList.length})" Margin="0,0,0,15" CanSwap="True" IsSwapped="False">
    <StackPanel Margin="25,40,23,15">
${rows}
    </StackPanel>
</local:MyCard>`;
  } else {
    playerCard = `<local:MyCard Title="在线玩家" Margin="0,0,0,15" CanSwap="True">
    <StackPanel Margin="25,40,23,15">
        <TextBlock TextWrapping="Wrap" Text="${online > 0 ? "已获取在线人数，但暂无详细玩家列表" : "暂无玩家在线"}" />
    </StackPanel>
</local:MyCard>`;
  }

  // 公告
  let annCard;
  if (a.length > 0) {
    const items = a.map((ai,i) => `            <StackPanel Margin="0,${i>0?"10":"0"},0,0">
                <TextBlock TextWrapping="Wrap" Margin="0,0,0,2" Text="${esc(ai.content||"")}" />
                <TextBlock TextWrapping="Wrap" FontSize="11" Foreground="#888888" Text="${esc(fmtTime(ai.timestamp))}" />
            </StackPanel>`).join("\n");
    annCard = `<local:MyCard Title="公告 (${a.length})" Margin="0,0,0,15" CanSwap="True" IsSwapped="False">
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

  // 封禁
  let banCard;
  if (bn && bn.length > 0) {
    const items = bn.map((b,i) => `            <StackPanel Margin="0,${i>0?"10":"0"},0,0">
                <TextBlock TextWrapping="Wrap" FontWeight="Bold" Margin="0,0,0,2" Text="${esc(b.playerName||"?")}" />
                <TextBlock TextWrapping="Wrap" Margin="0,0,0,1" Text="原因：${esc(b.reason||"无")}" />
                <TextBlock TextWrapping="Wrap" Margin="0,0,0,1" FontSize="11" Foreground="#888888" Text="执行者：${esc(b.bannedBy||"?")}  ·  ${esc(fmtTime(b.bannedAt))}" />
                <TextBlock TextWrapping="Wrap" FontSize="11" Foreground="${b.isPermanent?"#FF5555":"#FFAA00"}" Text="${b.isPermanent?"永久封禁":"过期时间："+esc(fmtTime(b.expiresAt||"?"))}" />
            </StackPanel>`).join("\n");
    banCard = `<local:MyCard Title="封禁列表 (${bn.length})" Margin="0,0,0,15" CanSwap="True" IsSwapped="False">
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

  // 数据摘要
  const sp = [];
  if (sm) {
    if (sm.peak_online != null) sp.push(`📈 历史峰值：${sm.peak_online} 人`);
    if (sm.avg_online != null) sp.push(`📊 平均在线：${Number(sm.avg_online).toFixed(1)} 人`);
    if (sm.total_unique_players != null) sp.push(`👥 独立玩家：${sm.total_unique_players} 人`);
  }
  if (bc != null) sp.push(`🏗️ 建筑作品：${bc} 个`);
  let summaryCard;
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

  return `<local:MyCard Title="Mik Casual 服务器状态" Margin="0,0,0,15" CanSwap="True" IsSwapped="False">
    <StackPanel Margin="25,40,23,15">
        <StackPanel Orientation="Horizontal" Margin="0,0,0,8">
            <TextBlock Text="●" FontSize="14" Foreground="${sc}" Margin="0,0,6,0" VerticalAlignment="Center" />
            <TextBlock Text="${esc(st)}" FontSize="16" Foreground="${sc}" VerticalAlignment="Center" />
            <TextBlock Text="   ${esc(SERVER_ADDR)}" FontSize="13" Foreground="#888888" VerticalAlignment="Center" Margin="8,0,0,0" />
        </StackPanel>
        <local:MyHint Text="点击下方按钮即可一键启动游戏并加入服务器！" Theme="Blue" Margin="0,0,0,12" />
        <StackPanel HorizontalAlignment="Center">
            <local:MyButton Margin="0,0,0,0" Width="260" Height="42" Padding="20,0,20,0" ColorType="Highlight"
                        Text="🚀 启动游戏并加入服务器" EventType="启动游戏" EventData="\\current|${esc(SERVER_ADDR)}"
                        ToolTip="使用当前选中的 Minecraft 版本启动，并自动进入 ${esc(SERVER_ADDR)}" />
        </StackPanel>
        <StackPanel Orientation="Horizontal" HorizontalAlignment="Center" Margin="0,12,0,0">
            <local:MyButton Margin="0,0,10,0" Width="125" Height="42" Padding="13,0,13,0"
                        Text="刷新" EventType="刷新主页" />
            <local:MyButton Margin="0,0,0,0" Width="125" Height="42" Padding="13,0,13,0"
                        Text="复制 IP" EventType="复制文本" EventData="${esc(SERVER_ADDR)}" />
        </StackPanel>
    </StackPanel>
</local:MyCard>

${playerCard}
${annCard}
${banCard}
${summaryCard}

<local:MyCard Title="网页入口" Margin="0,0,0,15" CanSwap="True" IsSwapped="True">
    <StackPanel Margin="25,40,23,15">
        <TextBlock TextWrapping="Wrap" Margin="0,0,0,8" Text="以下入口将在浏览器中打开对应页面。" />
        <local:MyListItem Margin="-5,2,-5,5" Title="建筑展示" Info="查看所有建筑作品详情"
                          EventType="打开网页" EventData="https://mik.noctiro.moe/buildings" Type="Clickable" />
        <local:MyListItem Margin="-5,2,-5,5" Title="封禁列表" Info="查看当前封禁记录"
                          EventType="打开网页" EventData="https://mik.noctiro.moe/bans" Type="Clickable" />
        <local:MyListItem Margin="-5,2,-5,5" Title="Wiki" Info="服务器帮助文档"
                          EventType="打开网页" EventData="https://mik.noctiro.moe/wiki" Type="Clickable" />
    </StackPanel>
</local:MyCard>

<local:MyCard Title="关于" Margin="0,0,0,15" CanSwap="True" IsSwapped="True">
    <StackPanel Margin="25,40,23,10">
        <TextBlock TextWrapping="Wrap" Margin="0,0,0,6" Text="Mik Casual 是一个 Minecraft 生存服务器。本主页数据由 GitHub Actions 自动更新。" />
        <TextBlock TextWrapping="Wrap" FontSize="11" Foreground="#666666" HorizontalAlignment="Center" Margin="0,10,0,0"
                   Text="更新时间: {time}  ·  PCL {pcl_version}  ·  Powered by MikWeb" />
    </StackPanel>
</local:MyCard>`;
}

const xaml = await build();
fs.writeFileSync("Custom.xaml", xaml, "utf-8");
console.log("Custom.xaml updated");
