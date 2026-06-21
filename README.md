# MikWeb PCL 主页

Mik Casual 服务器的 PCL 启动器自定义主页，实时显示在线玩家、公告、封禁列表等数据。

---

## 安装 Node.js

1. 打开 https://nodejs.org
2. 下载 **LTS** 版本（左边绿色按钮）
3. 运行安装程序，一路点 Next，全部默认即可
4. 安装完后打开 CMD，输入 `node -v` 验证，显示版本号即成功

---

## 使用

| 文件 | 操作 |
|------|------|
| `start.bat` | 双击启动服务器（最小化窗口） |
| `stop.bat` | 双击停止服务器 |
| `install-startup.bat` | 右键 → **以管理员身份运行**，开机自动启动 |
| `uninstall-startup.bat` | 双击取消开机自启 |

## PCL 配置

**设置 → 个性化 → 主页 → 联网更新的下载地址**

```
http://localhost:38080/pcl-homepage.xaml
```

## 环境变量（可选）

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `38080` | 监听端口 |
| `API_BASE` | `https://mik.noctiro.moe/api` | MikWeb API 地址 |
| `SERVER_ADDR` | `noctiro.moe` | MC 服务器连接地址 |

```powershell
# 示例：改端口
$env:PORT="12345"
node server.js
```

---

## 在线版（备选，无需本地运行）

```
https://rainboow1908.github.io/mikweb-pcl-homepage/Custom.xaml
```

> 手动触发更新：https://github.com/Rainboow1908/mikweb-pcl-homepage/actions

---

## 参考

- [PCL Wiki - 替换标记](https://github.com/Meloong-Git/PCL/wiki/%E6%9B%BF%E6%8D%A2%E6%A0%87%E8%AE%B0)
- [PCL Wiki - 自定义事件](https://github.com/Meloong-Git/PCL/wiki/%E8%87%AA%E5%AE%9A%E4%B9%89%E4%BA%8B%E4%BB%B6)
