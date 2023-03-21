<template>
    <!--:style="fontColor"-->
    <div class="fullWindow" >
        <!--<div class="backgroundclass" style="transition: all 0.5s">-->
            <!--<div class="backBodyClass" style="transition: all 0.5s" :style="backGroundChild"></div>-->
        <!--</div>-->
        <div class="main-right">
            <!--:style="backGroundParent"-->
            <header class="headDiv">
                <slot name="header"></slot>
            </header>
            <main class="bodyDiv" >
                <slot>
                    <!--<transition :name="transitionGroup.trransitionName" :mode="transitionGroup.mode">-->
                        <!--<router-view v-if="!$route.meta.keepAlive" :class="transitionGroup.routerClass"></router-view>-->
                    <!--</transition>-->

                    <!--<transition :name="transitionGroup.trransitionName" :mode="transitionGroup.mode">-->
                        <!--<keep-alive  exclude="toolUnDown">-->
                            <!--<router-view :class="transitionGroup.routerClass"></router-view>-->
                        <!--</keep-alive>-->
                        <keep-alive >
                            <!--v-if="$route.meta.keepAlive"-->
                            <router-view  :class="transitionGroup.routerClass"></router-view>
                        </keep-alive>
                    <!--</transition>-->
                </slot>
            </main>
        </div>
    </div>
</template>
<script>
    import {mapGetters} from 'vuex'

    export default {
        name: 'mainFrame',
        computed: {
            ...mapGetters([
                // 'backGroundParent',
                // 'backGroundChild',
                // 'fontColor',
                'transitionGroup',
            ])
        },
        data() {
            return {
                currentTab: 'first',
                drawer: false
            }
        },
        methods:{
            showDownDetail(){
                this.drawer = true
            }
        }
    }
</script>
<style scoped lang="scss">

    $bodyPadding: 0px;

    .good-item{
        width: calc(100% - 20px);
        height: 80px;
        line-height: 80px;
        margin: 10px;
        background: #7ac5ff;
        img{
            width: 60px;
            height: 60px;
            margin-top: 10px;
            margin-left: 10px;
            float: left;
        }
        .good-item-name{
            display: inline-block;
            font-weight: 600;
            margin-left: 10px;
        }
        .good-item-tip{
            display: inline-block;
            margin-right: 20px;
            float: right;
        }
    }



    .fullWindow {
        border-radius: 3px;
        width: 100%;
        height: 100%;
        /*display: flex;*/
        /*flex-direction: column;*/
        box-shadow: 0 1px 6px 1px rgba(0, 0, 0, 0.3);
        /*justify-content: space-between;*/
        overflow: hidden;
        position: relative;
    }

    .bodyDiv {
        width: calc(100% - #{$bodyPadding} - #{$bodyPadding});
        height: calc(100% - 60px);
        overflow-y: auto;
        word-break: break-all;
        flex-grow: 1;
        position: relative;
        overflow-x: hidden;
        padding: $bodyPadding;
    }

    .headDiv {
        /*flex-shrink: 0;*/
        /*-webkit-app-region: drag;*/
    }

    .footDiv {
        flex-shrink: 0;
    }

    .backgroundclass {
        z-index: -1;
        position: absolute;
        width: 100%;
        height: 100%;
        overflow: hidden;
        box-sizing: border-box;
    }

    /* .backgroundclass::after{
        content: "";
        width:100%;
        height:100%;
        position: absolute;
        background: inherit;
        filter: attr(data-attr);
        overflow: hidden;
        box-sizing: border-box;
    } */
    .backBodyClass {
        width: 100%;
        height: 100%;
        overflow: hidden;
        box-sizing: border-box;
    }

    .main-left {
        width: 64px;
        display: inline-block;
        float: left;
        height: 100%;
    }

    .main-right {
        width: calc(100%);
        display: inline-block;
        float: right;
        height: 100%;
    }
</style>
<style>
    #downDetail .el-drawer{
        left: 64px;
        top: 1px;
        bottom: 1px;
        height: calc(100% - 2px);
    }
</style>
