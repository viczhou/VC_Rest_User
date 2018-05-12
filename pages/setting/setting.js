Page({
    data: {
        head_img: 'https:viczhou.cn/test.jpg',
        pay_img: 'https://viczhou.cn/test.jpg',
        show_pay: false,
        show_func:false,
        grids: [0, 1, 2, 3, 4, 5],
        data: [{
            'show': -1,
            'table': 9,
            'price': '425.00',
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
        wx.getUserInfo({
            success: function (res) {

                that.setData({
                    head_img: res.userInfo.avatarUrl,
                    nickName: res.userInfo.nickName
                })

                wx.setStorage({
                    key: 'nickName',
                    data: res.userInfo.nickName,
                })
                wx.setStorage({
                    key: 'head_img',
                    data: res.userInfo.head_img,
                })
            }
        })
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

        for (let i = 0; i < this.data.data.length; i++) {
            if (this.data.data[i].order_id == order_id) {
                order_price = this.data.data[i].price
            }
        }
        let url = 'https://cli.im/api/qrcode/code?text={order_id:' + order_id + ',order_price:' + order_price + '}&&mhid=5hbOCw/uk8IhMHcqKtdRPKw'
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
            show_func:false
        })

        ////查询状态，隐藏按钮

    },
    func:function(e){
        let order_id = e.currentTarget.dataset.id
        this.setData({
            show_func: true
        })
    },
    clickFunc:function(e){
        let index = e.currentTarget.dataset.index
        console.log('点击了'+index)
    }
})  