import { parse } from "@std/jsonc"

import { ConfigString } from "./Resource.ts"

import Logger from "./Logger.ts"
const logger = new Logger("Config")

export type Config = {
    // 身份验证信息
    Auth: {
        AccessKeyId: string
        AccessKeySecret: string
    }
    // 执行周期[分钟]
    Cycle: number
    // 动态域名记录
    DDNSRecords: {
        // 记录ID
        RecordId: number
        // IP版本[4/6]
        IpVersion: 4 | 6
        // TTL[1(自动)]
        TTL: number
    }[]
}

// 判断配置文件是否存在
if (
    await Deno.lstat("./Config.jsonc").then((configFile) => {
        return !configFile.isFile
    }).catch(() => {
        return true
    })
) {
    logger.warn("配置文件不存在，已自动释放配置文件[Config.jsonc]！")
    Deno.writeTextFileSync("./Config.jsonc", ConfigString)
    Deno.exit(0)
}

// 读取配置文件
export const config = parse(Deno.readTextFileSync("./Config.jsonc")) as Config

// 校验配置项
if (
    config["Auth"] == null || config["Auth"]["AccessKeyId"] == null ||
    config["Auth"]["AccessKeySecret"] == null
) {
    logger.fatal("配置文件校验错误，请填写身份验证信息！")
}
if (config["Cycle"] == null) {
    logger.fatal("配置文件校验错误，请填写执行周期！")
}
if (config["DDNSRecords"] == null || config["DDNSRecords"].length == 0) {
    logger.fatal("配置文件校验错误，请填写动态域名记录信息！")
}
for (const record of config["DDNSRecords"]) {
    if (
        record["RecordId"] == null ||
        (record["IpVersion"] != 4 && record["IpVersion"] != 6) ||
        record["TTL"] == null
    ) {
        logger.fatal("配置文件校验错误，请检查动态域名记录信息！")
    }
}
