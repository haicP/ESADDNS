import ESAClient from "./ESAClient.ts"
import IPApi from "./IPApi.ts"

import { config } from "./Config.ts"

import Logger from "./Logger.ts"
const logger = new Logger("main")

console.log(`                                                                                         
                                                                                 ,--.              
        ,---,.   .--.--.       ,---,            ,---,         ,---,            ,--.'|   .--.--.    
      ,'  .' |  /  /    '.    '  .' \\         .'  .' \`\\     .'  .' \`\\      ,--,:  : |  /  /    '.  
    ,---.'   | |  :  /\`. /   /  ;    '.     ,---.'     \\  ,---.'     \\  ,\`--.'\`|  ' : |  :  /\`. /  
    |   |   .' ;  |  |--\`   :  :       \\    |   |  .\`\\  | |   |  .\`\\  | |   :  :  | | ;  |  |--\`   
    :   :  |-, |  :  ;_     :  |   /\\   \\   :   : |  '  | :   : |  '  | :   |   \\ | : |  :  ;_     
    :   |  ;/|  \\  \\    \`.  |  :  ' ;.   :  |   ' '  ;  : |   ' '  ;  : |   : '  '; |  \\  \\    \`.  
    |   :   .'   \`----.   \\ |  |  ;/  \\   \\ '   | ;  .  | '   | ;  .  | '   ' ;.    ;   \`----.   \\ 
    |   |  |-,   __ \\  \\  | '  :  | \\  \\ ,' |   | :  |  ' |   | :  |  ' |   | | \\   |   __ \\  \\  | 
    '   :  ;/|  /  /\`--'  / |  |  '  '--'   '   : | /  ;  '   : | /  ;  '   : |  ; .'  /  /\`--'  / 
    |   |    \\ '--'.     /  |  :  :         |   | '\` ,/   |   | '\` ,/   |   | '\`--'   '--'.     /  
    |   :   .'   \`--'---'   |  | ,'         ;   :  .'     ;   :  .'     '   : |         \`--'---'   
    |   | ,'                \`--''           |   ,.'       |   ,.'       ;   |.'                    
    \`----'                                  '---'         '---'         '---'                      
                                                                                               
                                        ESADDNS - {{version}}
`)

const esaClient = new ESAClient()

async function updateDNS() {
    logger.info(`开始更新 DNS 记录...`)
    const ipv4 = await IPApi.getIP(4)
    const ipv6 = await IPApi.getIP(6)
    logger.info(`已获取 IPv4: ${ipv4}, IPv6: ${ipv6}`)

    // 并行处理所有DNS记录
    const promises = config.DDNSRecords.map(async (recordsId) => {
        const newIp = recordsId.IpVersion == 4 ? ipv4 : ipv6
        const newTtl = recordsId.TTL

        try {
            const r = await esaClient.getRecord(recordsId.RecordId)
            const oldTtl = r.recordModel?.ttl
            const oldIp = r.recordModel?.data?.value
            const recordsName = r.recordModel?.recordName

            if (oldIp == newIp && oldTtl == newTtl) {
                logger.info(
                    `记录[ ${recordsId.RecordId} | ${recordsName} ]无变更，无需更新！`,
                )
                return
            }

            await esaClient.updateRecord(recordsId.RecordId, newIp, newTtl)
            logger.info(
                `更新记录[ ${recordsId.RecordId} | ${recordsName} ]成功! Data:${oldIp} => ${newIp} | TTL ${oldTtl} => ${newTtl}}`,
            )
        } catch (e) {
            logger.error(`处理记录[${recordsId.RecordId}]出错: ${e.message || e}`)
        }
    })

    // 等待所有记录处理完成
    await Promise.all(promises)
    logger.info(`更新 DNS 完毕！`)
}
// updateDNS()

logger.info(`开始执行任务, 周期: ${config.Cycle}(分钟)`)
setInterval(() => {
    updateDNS()
}, 1000 * 60 * config.Cycle)
