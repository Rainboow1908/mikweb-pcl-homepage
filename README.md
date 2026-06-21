# MikWeb PCL 主页

Mik Casual 服务器的 PCL 启动器自定义主页。

---

## 🚀 本地部署（推荐）

电脑开着就能用，数据实时拉取 MikWeb API，无延迟。

### 前置要求

- [Node.js](https://nodejs.org) 安装（LTS 版本即可）

### 启动

双击 `start.bat`（最小化窗口运行）。

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
