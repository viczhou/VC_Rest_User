const APP_ID = 'wx84d3339d9842ade6';
const APP_SECRET = '2141ed76f1c6d6efb06ff66f9b928a9c';

Page({
    data: {
        //用于检测是否激活菜单
        flag: 0,
        // 使用data数据对象设置样式名  
        cateImg: "/images/cate.png",
        redhot: 0,
        totalMoney: 0,
        showdetail: false
    },
    openConfirm: function () {
        let that = this
        wx.showModal({
            content: '运行软件需要获取用户头像昵称等信息，请前往设置打开相应权限',
            confirmText: "确认",
            cancelText: "取消",
            success: function (res) {
                //点击“确认”时打开设置页面
                if (res.confirm) {
                    wx.openSetting({
                        success: function (res) {
                        }
                    })
                } else {
                    wx.navigateBack({
                        delta: 1
                    })
                }
            }
        });
    },
    onShow: function () {
        // wx.getUserInfo({
        //     fail: function () {
        //         wx.getSetting({
        //             success: function (res) {
        //                 if (!res.authSetting['scope.userInfo']) {
        //                     //this.openConfirm()
        //                 }
        //             }.bind(this)
        //         })
        //     }.bind(this)
        // })
    },
    onLoad: function (opt) {
        let that = this
        wx.login({
            success: function (res) {
                let js_code = res.code
                console.log(js_code)

                wx.request({
                    url: 'https://viczhou.cn/vc_rest/utils/openId',
                    method: 'POST',
                    header: {
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    data: {
                        js_code: js_code
                    },
                    success: function (res) {
                        //openid
                        console.log(res.data)

                        //请求保存或查询user_id
                        wx.request({
                            url: 'https://viczhou.cn/vc_rest/user/check',
                            header: {
                                'content-type': 'application/x-www-form-urlencoded'
                            },
                            method: 'POST',
                            data: {
                                open_id: res.data.openid
                            },
                            success: function (e) {
                                if (e.data.msg == 0) {
               
                                    wx.setStorageSync("user_id", e.data.user_id)

                                }
                            }
                        })

                        //请求菜单
                        let shop_id = 1 // opt.xxxxxxx
                        let table = 1 // opt.xxxxx

                        wx.setStorage({
                            key: 'shop_id',
                            data: shop_id,
                        })

                        wx.setStorage({
                            key: 'table',
                            data: table,
                        })

                        wx.request({
                            url: 'https://viczhou.cn/vc_rest/shop_menu/getMenu',
                            method: 'POST',
                            header: {
                                'content-type': 'application/x-www-form-urlencoded' // 默认值
                            },
                            data: {
                                shop_id: wx.getStorageSync('shop_id')
                            },
                            success: function (res) {
                                wx.setStorageSync('menu_data', res.data.menu)
                                let foodListId = Array.apply(null, Array(res.data.menu.length)).map(function (item, i) {
                                    return 0;
                                });

                                that.setData({
                                    menu_data: res.data.menu,
                                    foodListId: foodListId,
                                    all_food: foodListId
                                })
                                //console.log(res.data.menu)
                                if (that.data.menu_data.length > 0) {
                                    wx.request({
                                        url: 'https://viczhou.cn/vc_rest/food/getFood',
                                        method: 'POST',
                                        header: {
                                            'content-type': 'application/x-www-form-urlencoded' // 默认值
                                        },
                                        data: {
                                            menu_id: that.data.menu_data[0].menu_id
                                        },
                                        success: function (res) {
                                            let arr = Array.apply(null, Array(res.data.data.length)).map(function (item, i) {
                                                return 0;
                                            });
                                            let foodListId = that.data.foodListId
                                            foodListId[0] = arr

                                            let all_food = that.data.all_food
                                            all_food[0] = res.data.data

                                            that.setData({

                                                foodListId: foodListId,
                                                all_food: all_food
                                            })
                                        }
                                    })
                                }
                            }
                        })

                    }
                })
            }
        })

        let shop_id = 9
        wx.request({
            url: 'https://viczhou.cn/vc_rest/shop/getShopInfo',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                shop_id: shop_id
            },
            method: 'POST',
            success: function (e) {
                if (e.data.msg == 0) {
                    wx.setNavigationBarTitle({
                        title: e.data.shop_name,
                    })
                }
            }
        })
    },
    menuClick: function (e) {
        let that = this
        if (this.data.flag != e.currentTarget.dataset.idx) {
            this.setData({
                flag: e.currentTarget.dataset.idx
            })
            let all_food = that.data.all_food
            if (all_food[e.currentTarget.dataset.idx] == 0)
                //请求数据
                wx.request({
                    url: 'https://viczhou.cn/vc_rest/food/getFood',
                    method: 'POST',
                    header: {
                        'content-type': 'application/x-www-form-urlencoded' // 默认值
                    },
                    data: {
                        menu_id: this.data.menu_data[this.data.flag].menu_id
                    },
                    success: function (res) {

                        all_food[e.currentTarget.dataset.idx] = res.data.data
                        if (res.data.msg == 0) {
                            let foodListId = that.data.foodListId
                            if (foodListId[that.data.flag] == 0) {
                                let arr = Array.apply(null, Array(res.data.data.length)).map(function (item, i) {
                                    return 0;
                                });

                                foodListId[e.currentTarget.dataset.idx] = arr

                                this.setData({

                                    foodListId: foodListId,
                                    all_food: all_food
                                })
                            } else {

                                this.setData({

                                    all_food: all_food
                                })
                            }
                        }
                    }.bind(this)
                })
        }
    },
    isCateHas: function () {
        let num = 0;

        for (let i = 0; i < this.data.foodListId.length; i++) {
            for (let j = 0; j < this.data.foodListId[i].length; j++) {
                num += + this.data.foodListId[i][j];
            }
        }
        if (num == 0) {
            return false;
        } else {
            return true
        }
    },
    /* 点击减号 */
    bindMinus: function (e) {

        let index = e.currentTarget.dataset.id
        let data = this.data.foodListId
        let f = this.data.flag
        if (e.currentTarget.dataset.flag != undefined) {
            f = e.currentTarget.dataset.flag
        }
        var num = data[f][index];
        let totalMoney = this.data.totalMoney
        totalMoney -= this.data.all_food[f][index].foodPrice

        let redhot = this.data.redhot
        // 如果大于1时，才可以减  
        if (num >= 1) {
            num--;
        }

        if (num == 0) {
            redhot--
        }

        data[f][index] = num
        // 将数值与状态写回  
        this.setData({
            foodListId: data,
            redhot: redhot,
            totalMoney: totalMoney
        });
        if (this.isCateHas()) {
            this.setData({
                cateImg: "/images/cate_.png"
            })
        } else {
            this.setData({
                cateImg: "/images/cate.png"
            })
        }
    },
    /* 点击加号 */
    bindPlus: function (e) {
        let index = e.currentTarget.dataset.id
        let data = this.data.foodListId
        let totalMoney = this.data.totalMoney

        let f = this.data.flag
        if (e.currentTarget.dataset.flag != undefined) {
            f = e.currentTarget.dataset.flag
        }

        totalMoney += this.data.all_food[f][index].foodPrice

        var num = data[f][index];
        // 不作过多考虑自增1  
        num++;
        // 只有大于一件的时候，才能normal状态，否则disable状态  
        var minusStatus = num < 1 ? 'disabled' : 'normal';

        data[f][index] = num
        // 将数值与状态写回  
        this.setData({
            foodListId: data,
            minusStatus: minusStatus,
            totalMoney: totalMoney
        });

        if (this.isCateHas()) {
            this.setData({
                cateImg: "/images/cate_.png"
            })
        } else {
            this.setData({
                cateImg: "/images/cate.png"
            })
        }
    },
    /* 输入框事件 */
    bindManual: function (e) {

        let index = e.currentTarget.dataset.id
        let data = this.data.foodListId
        let redhot = this.data.redhot
        let f = this.data.flag
        if (e.currentTarget.dataset.flag != undefined) {
            f = e.currentTarget.dataset.flag
        }
        let totalMoney = this.data.totalMoney

        let changeNum = data[f][index] - e.detail.value
        totalMoney -= changeNum * this.data.all_food[f][index].foodPrice

        data[f][index] = e.detail.value;

        if (e.detail.value == 0) {
            redhot--
        }
        // 将数值与状态写回  
        this.setData({
            foodListId: data,
            totalMoney: totalMoney
        });

        if (this.isCateHas()) {
            this.setData({
                cateImg: "/images/cate_.png",
                redhot: redhot
            })
        } else {
            this.setData({
                cateImg: "/images/cate.png"
            })
        }

    },
    addImg: function (e) {
        let index = e.currentTarget.dataset.id
        let data = this.data.foodListId
        let totalMoney = this.data.totalMoney

        data[this.data.flag][index] = 1

        totalMoney += this.data.all_food[this.data.flag][index].foodPrice

        let redhot = this.data.redhot
        redhot++
        this.setData({
            foodListId: data,
            cateImg: "/images/cate_.png",
            redhot: redhot,
            totalMoney: totalMoney
        })
    },
    cateClick: function () {
        let show = this.data.showdetail
        this.setData({
            showdetail: !show
        })
    },
    maintap: function () {
        this.setData({
            showdetail: false
        })
    },
    confirm: function () {
        let cate = []
        let item
        for (let i = 0; i < this.data.foodListId.length; i++) {
            for (let j = 0; j < this.data.foodListId[i].length; j++) {
                if (this.data.foodListId[i][j] != 0) {
                    item = {}
                    item['id'] = this.data.all_food[i][j].id
                    item['count'] = this.data.foodListId[i][j]

                    cate.push(item)
                }
            }
        }
        if (cate != [] && cate != null && cate != '') {
            wx.request({
                url: 'https://viczhou.cn/vc/BuildOrder',
                method: 'POST',
                header: {
                    'content-type': 'application/x-www-form-urlencoded' // 默认值
                },
                data: {
                    detail: JSON.stringify(cate),
                    shop_id: wx.getStorageSync('shop_id'),
                    user_id: wx.getStorageSync('user_id'),
                    table: 1,
                    order_price: this.data.totalMoney
                },
                success: function (res) {
                    let foodListId = this.data.foodListId
                    for (let i = 0; i < foodListId.length; i++) {
                        for (let j = 0; j < foodListId[i].length; j++) {
                            foodListId[i][j] = 0
                        }
                    }
                    if (res.data.msg == 0) {
                        this.setData({
                            totalMoney: 0,
                            redhot: 0,
                            foodListId: foodListId
                        })

                        wx.switchTab({
                            url: '/pages/setting/setting?order_id=' + res.data.order_id
                        })
                    }
                }.bind(this)
            })

        } else {
            wx.showToast({
                title: '请先点单',
                icon: 'none'
            })
        }
    }
})  