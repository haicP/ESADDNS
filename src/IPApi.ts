import Logger from "./Logger.ts"
const logger = new Logger("IPApi")

export default class IPApi {
    private static _v4Api = [
        "https://ipv4.icanhazip.com",
        "https://api4.ipify.org",
    ]

    private static _v6Api = [
        "https://ipv6.icanhazip.com",
        "https://api6.ipify.org",
    ]

    private static isIP(ip: string, ipVersion: number) {
        if (ipVersion == 4) {
            return /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
                .test(ip)
        } else {
            return /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/
                .test(ip)
        }
    }

    private static queryIPApi(number: number, ipVersion: number) {
        return new Promise((resolve) => {
            const api = ipVersion == 4
                ? IPApi._v4Api[number]
                : IPApi._v6Api[number]
            if (api == null) {
                logger.error(`查询 IP 失败：无 API 可用`)
                return
            }
            const request = new Request(api)
            fetch(request).then((response) => {
                response.text().then((text) => {
                    text = text.trim()
                    if (this.isIP(text, ipVersion) == false) {
                        logger.warn(`查询 IP 错误：[${api}] 这不是 IP ${text}`)
                        logger.warn(`正在尝试下一个接口。`)
                        this.queryIPApi(number + 1, ipVersion).then((ip) => {
                            resolve(ip)
                        })
                        return
                    }
                    resolve(text)
                }).catch((e) => {
                    logger.warn(`查询 IP 失败：[${api}] ${e}`)
                    logger.warn(`正在尝试下一个接口。`)
                    this.queryIPApi(number + 1, ipVersion).then((ip) => {
                        resolve(ip)
                    })
                })
            }).catch((e) => {
                logger.warn(`查询 IP 失败：[${api}] ${e}`)
                logger.warn(`正在尝试下一个接口。`)
                this.queryIPApi(number + 1, ipVersion).then((ip) => {
                    resolve(ip)
                })
            })
        })
    }

    public static getIP(ipVersion: number = 4): Promise<string> {
        return new Promise((resolve) => {
            this.queryIPApi(0, ipVersion).then((ip) => {
                resolve(ip)
            })
        })
    }
}
