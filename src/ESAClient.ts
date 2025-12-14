import $ESA20240910 from "@alicloud/esa20240910"
import * as $OpenApi from "@alicloud/openapi-client"
import Credential, { Config } from "@alicloud/credentials"
import * as $Util from "@alicloud/tea-util"

import { config } from "./Config.ts"

import Logger from "./Logger.ts"
const logger = new Logger("ESAClient")

export default class ESAClient {
    private _runtime = new $Util.RuntimeOptions({ timeout: 30000 }) // 30秒超时
    private _client: $ESA20240910.default

    /**
     * 创建 ESA 客户端对象
     */
    constructor() {
        const credentialsConfig = new Config({
            type: "access_key",
            accessKeyId: config.Auth.AccessKeyId,
            accessKeySecret: config.Auth.AccessKeySecret,
        })

        const credential = new Credential.default(credentialsConfig)
        const openApiConfig = new $OpenApi.Config({
            credential: credential,
            endpoint: `esa.cn-hangzhou.aliyuncs.com`,
            readTimeout: 30000, // 30秒读取超时
            connectTimeout: 30000, // 30秒连接超时
        })

        this._client = new $ESA20240910.default(openApiConfig)
    }

    /**
     * 获取DNS记录列表
     * @param siteId 站点ID
     */
    public getRecordsList(
        siteId: number,
    ): Promise<$ESA20240910.ListRecordsResponse> {
        return new Promise((resolve, reject) => {
            this._client.listRecordsWithOptions(
                new $ESA20240910.ListRecordsRequest({
                    siteId: siteId,
                }),
                this._runtime,
            ).then((r) => {
                resolve(r)
            }).catch((e) => {
                if (e.code == "SiteNotFound") {
                    logger.error(
                        `获取站点[${siteId}]记录列表出错，网站未找到，请确保 SITE_ID[站点ID] 设置正确！`,
                    )
                } else if (e.code == "InvalidSiteId") {
                    logger.error(
                        `获取站点[${siteId}]记录列表出错，SITE_ID 无效，请确保 SITE_ID[站点ID] 设置正确！`,
                    )
                } else if (e.code == "Forbidden") {
                    logger.error(
                        `获取站点[${siteId}]记录列表出错，AccessKey 无 esa:ListRecords 权限！`,
                    )
                } else {
                    logger.error(
                        `获取站点[${siteId}]列表出错，原因：[${e.code}] ${e.message || e.data?.Message || JSON.stringify(e)}`,
                    )
                }
                reject(e)
            })
        })
    }
    /**
     * 获取DNS记录详情
     * @param recordId 记录ID
     */
    public getRecord(
        recordId: number,
    ): Promise<$ESA20240910.GetRecordResponseBody> {
        return new Promise((resolve, reject) => {
            this._client.getRecordWithOptions(
                new $ESA20240910.GetRecordRequest({
                    recordId: recordId,
                }),
                this._runtime,
            ).then((r) => {
                resolve(r.body)
            }).catch((e) => {
                if (e.code == "Record.NotFound") {
                    logger.error(
                        `获取记录[${recordId}]详情出错，记录 ID 不存在！`,
                    )
                } else if (e.code == "InvalidRecordId") {
                    logger.error(
                        `获取记录[${recordId}]详情出错，记录 ID 无效！`,
                    )
                } else if (e.code == "Forbidden") {
                    logger.error(
                        `更新记录[${recordId}]详情出错，AccessKey 无 esa:GetRecord 权限！`,
                    )
                } else {
                    logger.error(
                        `获取记录[${recordId}]详情出错，原因：[${e.code}] ${e.message || e.data?.Message || JSON.stringify(e)}`,
                    )
                }
                reject(e)
            })
        })
    }

    /**
     * 创建DNS记录
     * @param siteId 站点ID
     * @param recordName 记录名称
     * @param recordValue 记录值
     * @param ttl TTL
     *
     * @return 创建的记录ID
     */
    public createRecord(
        siteId: number,
        recordName: string,
        recordValue: string,
        ttl: number = 1,
    ) {
        return new Promise((resolve, reject) => {
            this._client.createRecordWithOptions(
                new $ESA20240910.CreateRecordRequest({
                    sourceType: "Domain",
                    type: "A/AAAA",
                    recordName: recordName,
                    siteId: siteId,
                    ttl: ttl,
                    data: {
                        "value": recordValue,
                    },
                }),
                this._runtime,
            ).then((r) => {
                resolve(r.body?.recordId)
            }).catch((e) => {
                if (
                    e.code == "Record.RecordNameConflictForSpecifiedRecordType"
                ) {
                    logger.error(
                        `创建记录[${recordName}]出错，记录已存在！`,
                    )
                } else if (
                    e.code == "Forbidden"
                ) {
                    logger.error(
                        `创建记录[${recordName}]出错，AccessKey 无 esa:CreateRecord 权限！`,
                    )
                } else {
                    logger.error(
                        `创建记录[${recordName}]出错，原因：[${e.code}] ${e.message || e.data?.Message || JSON.stringify(e)}`,
                    )
                }
                reject(e)
            })
        })
    }

    /**
     * 更新DNS记录
     * @param recordId 记录ID
     * @param recordValue 记录值
     * @param ttl TTL
     */
    public updateRecord(
        recordId: number,
        recordValue: string,
        ttl: number = 1,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            this._client.updateRecordWithOptions(
                new $ESA20240910.UpdateRecordRequest({
                    sourceType: "Domain",
                    type: "A/AAAA",
                    recordId: recordId,
                    ttl: ttl,
                    data: {
                        "value": recordValue,
                    },
                }),
                this._runtime,
            ).then(() => {
                resolve()
            }).catch((e) => {
                if (e.code == "Record.NotFound") {
                    logger.error(
                        `更新记录[${recordId}]出错，记录不存在！`,
                    )
                }
                if (e.code == "InvalidRecordId") {
                    logger.error(
                        `更新记录[${recordId}]出错，RecordId 无效！`,
                    )
                } else if (e.code == "Forbidden") {
                    logger.error(
                        `更新记录[${recordId}]出错，AccessKey 无 esa:UpdateRecord 权限！`,
                    )
                } else {
                    logger.error(
                        `更新记录[${recordId}]出错，原因：[${e.code}] ${e.message || e.data?.Message || JSON.stringify(e)}`,
                    )
                }
                reject(e)
            })
        })
    }
}
