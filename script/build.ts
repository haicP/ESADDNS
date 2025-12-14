#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run --allow-env

/**
 * ESADDNS 构建脚本
 * 将 Deno 项目编译为所有受支持平台的可执行文件
 */
interface DenoJson {
    version: string
    tasks?: Record<string, string>
    imports?: Record<string, string>
}

// 从 deno.json 获取版本号
const denoJsonText = await Deno.readTextFile("./deno.json")
const denoJson = JSON.parse(denoJsonText) as DenoJson
const version = denoJson.version

if (!version) {
    console.error("错误: 在 deno.json 中找不到版本号")
    Deno.exit(1)
}

console.log(`正在构建 ESADDNS 版本 ${version}...`)

// 清理并创建 dist 目录
await Deno.remove("./dist", { recursive: true }).catch(() => {})
await Deno.mkdir("./dist", { recursive: true })
await Deno.mkdir("./dist/src", { recursive: true })

// 将 src 目录复制到 dist
const copySrcCmd = new Deno.Command("cp", {
    args: ["-r", "./src/.", "./dist/src"],
})
const copySrcResult = await copySrcCmd.output()

if (!copySrcResult.success) {
    console.error("无法将 src 目录复制到 dist")
    Deno.exit(1)
}

console.log("已复制 src 到 dist")

// 替换 main.ts 中的版本占位符
const mainTsPath = "./dist/src/main.ts"
let mainTsContent = await Deno.readTextFile(mainTsPath)
mainTsContent = mainTsContent.replace("{{version}}", version)

await Deno.writeTextFile(mainTsPath, mainTsContent)
console.log("已在 main.ts 中替换版本占位符")

// 定义目标平台
const platforms = [
    { target: "x86_64-unknown-linux-gnu", name: "linux-amd64" },
    { target: "aarch64-unknown-linux-gnu", name: "linux-arm64" },
    { target: "x86_64-apple-darwin", name: "macos-amd64" },
    { target: "aarch64-apple-darwin", name: "macos-arm64" },
    { target: "x86_64-pc-windows-msvc", name: "windows-amd64" },
]

// 为每个平台构建
for (const platform of platforms) {
    console.log(`正在为 ${platform.name} 编译...`)

    // 确定 Windows 的文件扩展名
    const ext = platform.target.includes("windows") ? ".exe" : ""

    const compileCmd = new Deno.Command("deno", {
        args: [
            "compile",
            "--allow-all",
            "--no-check",
            "--target",
            platform.target,
            "--output",
            `./dist/ESADDNS-${platform.name}-${version}${ext}`,
            "./dist/src/main.ts",
        ],
    })

    const compileProcess = compileCmd.spawn()
    const compileStatus = await compileProcess.status

    if (!compileStatus.success) {
        console.error(`无法为 ${platform.name} 编译`)
        continue
    }

    console.log(`已成功编译 ESADDNS-${platform.name}-${version}${ext}`)
}

console.log("构建过程完成！")
