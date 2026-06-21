# MikWeb PCL 主页

Mik Casual 服务器的 PCL 启动器自定义主页。

---

## 🚀 本地部署（推荐）

电脑开着就能用，数据实时拉取 MikWeb API，无延迟。

### 前置要求

- [Node.js](https://nodejs.org) 安装（LTS 版本即可）

### 启动

```bash
node server.js
```

### PCL 配置

**设置 → 个性化 → 主页 → 联网更新的下载地址**

```
http://localhost:38080/pcl-homepage.xaml
```

### 开机自启（无窗口、后台静默运行）

1. 右键 `install-startup.bat` → **以管理员身份运行**（只需一次）
2. 之后每次开机自动在后台启动，看不到任何窗口

### 手动后台启动

双击 `start-silent.vbs`，无 cmd 窗口。

### 停止

```powershell
Get-Process node | Stop-Process -Force
```

---

## 🌐 在线版（备选）

无需本地运行，数据由 GitHub Actions 定时更新。

```
https://rainboow1908.github.io/mikweb-pcl-homepage/Custom.xaml
```

> 手动触发更新：https://github.com/Rainboow1908/mikweb-pcl-homepage/actions/workflows/update.yml → **Run workflow**

---

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `38080` | 监听端口 |
| `API_BASE` | `https://mik.noctiro.moe/api` | MikWeb API 地址 |
| `SERVER_ADDR` | `noctiro.moe` | MC 服务器连接地址 |

```powershell
# 示例：改端口和服务器地址
$env:PORT="12345"; $env:SERVER_ADDR="play.example.com"; node server.js
```

---

## 参考

- [PCL Wiki - 替换标记](https://github.com/Meloong-Git/PCL/wiki/%E6%9B%BF%E6%8D%A2%E6%A0%87%E8%AE%B0)
- [PCL Wiki - 自定义事件](https://github.com/Meloong-Git/PCL/wiki/%E8%87%AA%E5%AE%9A%E4%B9%89%E4%BA%8B%E4%BB%B6)
