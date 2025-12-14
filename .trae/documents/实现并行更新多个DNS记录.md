### 实现并行更新多个DNS记录的方案

**当前问题**：
- 代码使用for循环逐个更新DNS记录，每次都等待前一个记录更新完成
- 效率较低，尤其是当有多个记录需要更新时

**解决方案**：
- 将DNS记录更新逻辑改为并行处理
- 使用Promise.all()同时执行所有记录的更新操作

**具体实现**：
1. 修改updateDNS函数，将for循环替换为并行处理
2. 为每个DNS记录创建一个异步处理函数
3. 收集所有处理函数的Promise
4. 使用Promise.all()并行执行这些Promise
5. 保持原有的错误处理逻辑

**预期效果**：
- 所有DNS记录同时开始更新，而不是按顺序等待
- 提高更新效率，尤其是当有多个记录时
- 保持原有的错误处理和日志记录
- 代码结构更加清晰

**修改文件**：
- /Users/haic/files/workspace/ESADDNS/src/main.ts

**修改内容**：
- 更新updateDNS函数，实现并行更新逻辑
- 将原有的for循环替换为Promise.all()
- 保持原有的错误处理和日志记录

**实现代码示例**：
```typescript
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