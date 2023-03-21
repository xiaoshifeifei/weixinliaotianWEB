import {localCache} from "@/utils/data/localData";
import JsBase64 from 'js-base64'

const USER_TOKEN = 'im-token'
const USER_INFO = 'LUMNEIM-USERINFO'
const USER_SETTING = 'LUMENIM_SETTING'

/**
 * 设置用户授权token
 *
 * @param {String} token
 * @param {Number} expires
 */
export function setToken(token) {
  return localCache.set(USER_TOKEN, token)
}

/**
 * 获取授权token
 */
export function getToken() {
  return localCache.get(USER_TOKEN)
}

/**
 * 设置用户信息
 *
 * @param {Object} data
 */
export function setUserInfo(data) {
  localCache.set(USER_INFO, JsBase64.Base64.encode(JSON.stringify(data)))
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  const data = JsBase64.Base64.decode(localCache.get(USER_INFO) || '')
  return data ? JSON.parse(data) : {}
}

/**
 * 获取用户本地缓存的设置信息
 */
export function getUserSettingCache() {
  const data = localCache.get(USER_SETTING)
  return data ? JSON.parse(data) : {}
}

/**
 * 用户设置保存到浏览器缓存中
 *
 * @param {Object} state 用户设置相关信息
 */
export function setUserSettingCache(state) {
  localCache.set(USER_SETTING, JSON.stringify(state))
}

/**
 * 删除用户相关缓存信息
 */
export function removeAll() {
  localCache.remove(USER_TOKEN)
  localCache.remove(USER_INFO)
  localCache.remove(USER_SETTING)
}
