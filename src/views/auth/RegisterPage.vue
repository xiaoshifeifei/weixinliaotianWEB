<template>
  <div>
    <el-container id="auth-container">
      <el-main>
        <div id="logo-name" class="animated slideInLeft">
          {{ $store.state.website_name }}
        </div>
        <div id="login-box">
          <div class="header">账号注册</div>
          <div class="main">
            <el-form ref="form" :model="form" :rules="rules">
              <el-form-item prop="telephone">
                <el-input
                  v-model="form.telephone"
                  placeholder="用户名"
                  class="cuborder-radius"
                  maxlength="11"
                  @keyup.enter.native="onSubmit('form')"
                >
                <country-code-selector v-if="accountType==0" slot="prepend" :countryCode.sync="form.areaCode"></country-code-selector>
              </el-input>
              </el-form-item>
              <el-form-item prop="password">
                <el-input
                  v-model="form.password"
                  type="password"
                  placeholder="密码"
                  class="cuborder-radius"
                  @keyup.enter.native="onSubmit('form')"
                />
              </el-form-item>
              <el-form-item prop="password2">
                <el-input
                  v-model="form.password2"
                  type="password"
                  placeholder="确认密码"
                  class="cuborder-radius"
                  @keyup.enter.native="onSubmit('form')"
                />
              </el-form-item>

              <el-form-item prop="nickname">
                <el-input
                        v-model="form.nickname"
                        placeholder="昵称"
                        class="cuborder-radius"
                        maxlength="11"
                        @keyup.enter.native="onSubmit('form')"
                />
              </el-form-item>

              <el-form-item prop="inviteCode" v-show="registerType=='1'">
                <el-input
                        v-model="form.inviteCode"
                        placeholder="邀请码"
                        class="cuborder-radius"
                        maxlength="11"
                        @keyup.enter.native="onSubmit('form')"
                />
              </el-form-item>

              <el-form-item prop="nickname" v-show="registerType=='1'">
                <el-input
                        v-model="form.nickname"
                        placeholder="昵称"
                        class="cuborder-radius"
                        maxlength="11"
                        @keyup.enter.native="onSubmit('form')"
                />
              </el-form-item>
              <!--<el-form-item prop="username">-->
                <!--<el-input-->
                  <!--v-model="form.username"-->
                  <!--placeholder="手机号"-->
                  <!--class="cuborder-radius"-->
                  <!--maxlength="11"-->
                  <!--@keyup.enter.native="onSubmit('form')"-->
                <!--/>-->
              <!--</el-form-item>-->
              <!--<el-form-item prop="smsCode">-->
                <!--<el-input-->
                  <!--v-model="form.smsCode"-->
                  <!--placeholder="验证码(随意填写)"-->
                  <!--class="cuborder-radius"-->
                  <!--maxlength="6"-->
                  <!--style="width: 205px"-->
                  <!--@keyup.enter.native="onSubmit('form')"-->
                <!--/>-->

                <!--<div v-if="smsLock" class="send-code-btn send-sms-disable">-->
                  <!--正在发送 ...-->
                <!--</div>-->
                <!--<div-->
                  <!--v-else-if="smsLock == false && smsLockObj.time == null"-->
                  <!--class="send-code-btn"-->
                  <!--@click="sendSms"-->
                <!--&gt;-->
                  <!--获取短信-->
                <!--</div>-->
                <!--<div v-else class="send-code-btn send-sms-disable">-->
                  <!--重新发送({{ smsLockObj.time }}s)-->
                <!--</div>-->
              <!--</el-form-item>-->
              <el-form-item>
                <el-button
                  type="primary"
                  class="submit-btn"
                  :loading="registerLoading"
                  @click="onSubmit('form')"
                >
                  立即注册
                </el-button>
              </el-form-item>
              <el-form-item>
                <div class="links">
                  <!--<el-link-->
                    <!--type="primary"-->
                    <!--:underline="false"-->
                    <!--@click="toLink('/forget')"-->
                  <!--&gt;-->
                    <!--找回密码-->
                  <!--</el-link>-->
                  <el-link
                    type="primary"
                    :underline="false"
                    @click="toLink('/login')"
                  >
                    已有账号，立即登录?
                  </el-link>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <div class="copyright" v-html="$store.state.copyright"></div>
      </el-main>
    </el-container>

    <div class="fly-box">
      <div class="fly bg-fly-circle1"></div>
      <div class="fly bg-fly-circle2"></div>
      <div class="fly bg-fly-circle3"></div>
      <div class="fly bg-fly-circle4"></div>
    </div>
  </div>
</template>
<script>
  import {ServeRegister, ServeSendVerifyCode, userApi} from '@/api/user'
  import { isMobile } from '@/utils/validate'
  import SmsLock from '@/plugins/sms-lock'
  import md5 from 'js-md5'

export default {
  name: 'RegisterPage',
  data() {
    let validateMobile = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('手机号不能为空！'))
        return
      }

      if (!isMobile(value)) {
        callback(new Error('手机号格式不正确！'))
      } else {
        callback()
      }
    }

    let validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.form.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }

    return {
      registerType: 0,
      registerLoading: false,
      form: {
        nickname: '',
        telephone: '',
        password: '',
        password2: '',
        smsCode: '',
        areaCode: 86,
      },
      rules: {
        nickname: [
          {
            required: true,
            message: '用户昵称不能为空!',
            trigger: 'blur',
          },
        ],
        username: [
          {
            validator: validateMobile,
            trigger: 'blur',
          },
        ],
        password: [
          {
            required: true,
            message: '登录密码不能为空!',
            trigger: 'blur',
          },
        ],
        password2: [
          {
            validator: validatePass2,
            trigger: 'blur',
          },
        ],
        sms_code: [
          {
            required: true,
            message: '验证码不能为空!',
            trigger: 'blur',
          },
        ],
      },

      smsLock: false,
      smsLockObj: null,
    }
  },
  created() {
    this.smsLockObj = new SmsLock('REGISTER_SMS', 120)
  },
  destroyed() {
    this.smsLockObj.clearInterval()
  },
  computed: {
    accountType(){
      return this.$store.state.settings.accountType
    }
  },
  methods: {
    toLink(url) {
      this.$router.push(url)
    },

    onSubmit(formName) {
      if (this.registerLoading) return false
      this.$refs[formName].validate(valid => {
        if (!valid) return false
        this.registerLoading = true
        this.register()
      })
    },

    register() {
      userApi.register({
        nickname: this.form.nickname,
        telephone: this.form.telephone,
        password: md5(this.form.password),
        smsCode: this.form.smsCode,
        areaCode: this.form.areaCode,
        isSmsRegister: 0,
      })
        .then(res => {
          if (res.resultCode == 1) {
            this.$notify({
              title: '成功',
              message: '注册成功,快去登录吧...',
              type: 'success',
            })

            this.$refs.form.resetFields()
            setTimeout(() => {
              this.toLink('/login')
            }, 1500)
          } else {
            this.$notify.info({
              title: '提示',
              message: res.resultMsg,
            })
          }
        })
        .catch(() => {
          this.$notify({
            message: '网络错误,请稍后再试...',
          })
        })
        .finally(() => {
          this.registerLoading = false
        })
    },

    // 点击发送验证码
    sendSms() {
      if (this.smsLock) return false

      if (!isMobile(this.form.username)) {
        this.$refs.form.validateField('username')
        return false
      }

      this.smsLock = true
      ServeSendVerifyCode({
        mobile: this.form.username,
        type: 'user_register',
      })
        .then(res => {
          if (res.resultCode == 1) {
            this.$notify({
              title: '成功',
              message: '验证码发送成功...',
              type: 'success',
            })

            this.smsLockObj.start()

            if (res.data.is_debug) {
              setTimeout(() => {
                this.$notify({
                  title: '提示',
                  message: '已自动填充验证码',
                })

                this.form.sms_code = res.data.sms_code
              }, 500)
            }
          } else {
            this.$notify({
              title: '提示',
              message: res.message,
              customClass: 'cus-notifyclass',
            })
          }
        })
        .finally(() => {
          this.smsLock = false
        })
    },
  },
}
</script>
<style lang="less">
@import '~@/assets/css/page/login-auth.less';
</style>
