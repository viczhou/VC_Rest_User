Page({
    data: {
        head_img: 'https:viczhou.cn/test.jpg',
        pay_img: '/images/loading.gif',
        show_pay: false,
        show_func: false,
        grids: [0, 1, 2, 3, 4, 5],
        img_title: ['加饭', '送水', '纸巾', '餐具', '催单', '退单'],
        imgs: ['rice', 'water', 'paper', 'tableware', 'order', 'back'],
        back: true,
        data: [{
            'show': -1,
            'table': 9,
            'price': '75.00',
            'time': '2018-03-15 15:30:20',
            'pid': '2018030500441',
            'status': 0,
            'order_id': 1,
            'detail': [{
                'image': 'https://viczhou.cn/test.jpg',
                'count': 1,
                'price': 75,
                'name': '超级麻辣好吃的不得了的牛肉偏偏呀'
            }
            ]
        }]
    },
    onShow: function () {
        wx.request({
            url: 'https://viczhou.cn/vc/FindOrderByUser',
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                user_id: wx.getStorageSync('user_id'),
                shop_id: wx.getStorageSync('shop_id')
            },
            success: function (res) {
                console.log(wx.getStorageSync('user_id'))
                let data = res.data.data
                let time
                let pid
                for (let i = 0; i < data.length; i++) {
                    time = data[i].time
                    time = time.split(".")[0]
                    data[i]['time'] = time

                    pid = time.replace("-", "").replace("-", "").replace(" ", "").replace(":", "").replace(":", "") + data[i]['order_id']
                    pid = pid.slice(2, pid.length);
                    data[i]['pid'] = pid

                }
                this.setData({
                    data: data
                })
            }.bind(this)
        })
    },
    onLoad: function () {


        let head_img = wx.getStorageSync('head_img')
        let nickName = wx.getStorageSync('nickName')
        nickName = nickName == undefined ? '' : nickName
        if (head_img != undefined) {
            this.setData({
                head_img: head_img,
                nickName: nickName
            })
        }
        let that = this
        // wx.getUserInfo({
        //     success: function (res) {

        //         that.setData({
        //             head_img: res.userInfo.avatarUrl,
        //             nickName: res.userInfo.nickName
        //         })

        //         wx.setStorage({
        //             key: 'nickName',
        //             data: res.userInfo.nickName,
        //         })
        //         wx.setStorage({
        //             key: 'head_img',
        //             data: res.userInfo.head_img,
        //         })
        //     }
        // })
    },
    isOpenDetail: function (e) {
        var d = e.currentTarget.id
        var data_res = this.data.data

        data_res[d].show = -data_res[d].show

        this.setData({
            data: data_res
        })
    },
    finishOrder: function (e) {
        let order_id = e.currentTarget.dataset.id
        let order_price
        let shop_id = wx.getStorageSync("shop_id")
        for (let i = 0; i < this.data.data.length; i++) {
            if (this.data.data[i].order_id == order_id) {
                order_price = this.data.data[i].price
            }
        }
        let url = 'https://cli.im/api/qrcode/code?text={"order_id":' + order_id + ',"order_price":' + order_price + ',"shop_id":' + shop_id + '}&&mhid=5hbOCw/uk8IhMHcqKtdRPKw'
        wx.request({
            url: url,  //网页
            //url:'https://pan.baidu.com/share/qrcode?w=150&h=150&url=你的内容', //二进制
            success: function (res) {
                let result = /qrcode_plugins_img ="(.*?)"/g
                let a = result.exec(res.data)[1]
                this.setData({
                    pay_img: a
                })
            }.bind(this)
        })

        this.setData({
            show_pay: true
        })
    },
    pay_img_disable: function () {
        this.setData({
            show_pay: false,
            show_func: false
        })
        wx.request({
            url: 'https://viczhou.cn/vc/FindOrderByUser',
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                user_id: wx.getStorageSync('user_id'),
                shop_id: wx.getStorageSync('shop_id')
            },
            success: function (res) {
                let data = res.data.data
                let time
                let pid
                for (let i = 0; i < data.length; i++) {
                    time = data[i].time
                    time = time.split(".")[0]
                    data[i]['time'] = time

                    pid = time.replace("-", "").replace("-", "").replace(" ", "").replace(":", "").replace(":", "") + data[i]['order_id']
                    pid = pid.slice(2, pid.length);
                    data[i]['pid'] = pid

                }
                this.setData({
                    data: data
                })
            }.bind(this)
        })
        ////查询状态，隐藏按钮

    },
    func: function (e) {
        let order_id = e.currentTarget.dataset.id
        this.setData({
            show_func: true
        })
    },
    clickFunc: function (e) {
        let index = e.currentTarget.dataset.index
        if (index < 5) {
            wx.request({
                url: 'https://viczhou.cn/vc/shopService',
                method: 'POST',
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                    shop_id: wx.getStorageSync("shop_id"),
                    table_id: wx.getStorageSync("table"),
                    msg: index
                },
                success: function (e) {
                    if (index < 2) {
                        wx.showToast({
                            title: '已通知服务员' + this.data.img_title[index],
                            icon: 'none'
                        })
                    } else if (index < 4) {
                        wx.showToast({
                            title: '已通知服务员拿' + this.data.img_title[index],
                            icon: 'none'
                        })
                    } else if (index == 4) {
                        wx.showToast({
                            title: '催单成功，服务员收到通知后将尽快上菜',
                            icon: 'none'
                        })
                    }
                },
                fail: function () {
                    wx.showToast({
                        title: '网络错误',
                        icon: 'none'
                    })
                }
            })
        } else {
            this.setData({
                back: false
            })
        }
    },
    back_confirm: function () {
        this.setData({
            back: true
        })
        wx.request({
            url: 'https://viczhou.cn/vc/shopService',
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                shop_id: wx.getStorageSync("shop_id"),
                table_id: wx.getStorageSync("table"),
                msg: 5
            },
            success: function (e) {
                wx.showToast({
                    title: '申请成功，等待服务员确认',
                    icon: 'none'
                })

            }
        })
    },
    back_cancel: function () {
        this.setData({
            back: true
        })
    }
})  