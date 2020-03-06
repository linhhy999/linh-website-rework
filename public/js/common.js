import PropTypes from 'prop-types';
import io from 'socket.io-client';
import dateformat from 'dateformat';
import routeMatcherLib from './routematcher.js';
import './sweetalert.min.js';


const T = {
    PropTypes,
    rootUrl: 'https://portal.hcmut.edu.vn',
    sexes: ['male', 'female'],
    academicDistinctions: ['doctor', 'master'],
    academicTitles: ['professor', 'associate professor'],
    questionTypes: { text: 'Văn bản', textArea: 'Đoạn văn bản', choice: 'Lựa chọn', multiChoice: 'Đa lựa chọn', date: 'Ngày tháng' },
    divisionTypes: { faculty: 'Khoa', department: 'Bộ môn', lab: 'Phòng thí nghiệm' },
    pageTypes: [
        '<empty>',
        'all divisions',
        'all events',
        'all jobs',
        'all news',
        'all staffs',
        'carousel',
        'contact',
        'content',
        'hot',
        'last events',
        'last jobs',
        'last news',
        'logo',
        'photoBooth',
        'slogan',
        'staff group',
        'statistic',
        'subscribe',
        'testimony',
        'video',
    ],
    defaultPageSize: 50,
    defaultUserPageSize: 21,
    defaultUserSidebarSize: 3,
    newsFeedPageSize: 4,
    eventFeedPageSize: 4,

    randomPassword: length => Math.random().toString(36).slice(-length),

    debug: (location.hostname === 'localhost' || location.hostname === '127.0.0.1'),

    isBKer: email => email.endsWith('@hcmut.edu.vn') || email.endsWith('@oisp.edu.vn'),

    ready: (pathname, done) => $(document).ready(() => setTimeout(() => {
        if (pathname == undefined) {
            done = null;
            pathname = window.location.pathname;
        } else if (typeof pathname == 'function') {
            done = pathname;
            pathname = window.location.pathname;
        }

        done && done();

        $('ul.app-menu > li').removeClass('is-expanded');
        $('ul.app-menu a.active').removeClass('active');
        let menuItem = $(`a.app-menu__item[href='${pathname}']`);
        if (menuItem.length != 0) {
            menuItem.addClass('active');
        } else {
            menuItem = $(`a.treeview-item[href='${pathname}']`);
            if (menuItem.length != 0) {
                menuItem.addClass('active');
                menuItem.parent().parent().parent().addClass('is-expanded');
            }
        }
    }, 250)),

    url: (url) => url + (url.indexOf('?') === -1 ? '?t=' : '&t=') + new Date().getTime(),

    download: (url, name) => {
        let link = document.createElement('a');
        link.target = '_blank';
        link.download = name;
        link.href = url;
        link.click();
    },

    cookie: (cname, cvalue, exdays) => {
        if (cvalue === undefined) {
            const name = cname + '=';
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i].trimStart();
                if (c.indexOf(name) === 0) {
                    try {
                        return JSON.parse(c.substring(name.length, c.length));
                    } catch {
                        return {};
                    }
                }
            }
            return {};
        } else {
            let d = new Date();
            d.setTime(d.getTime() + ((exdays === undefined ? 60 : exdays) * 24 * 60 * 60 * 1000));
            document.cookie = cname + '=' + JSON.stringify(cvalue) + ';expires=' + d.toUTCString() + ';path=/';
        }
    },

    cookieKeyName: {
        pageNumber: 'N',
        pageSize: 'S',
        pageCondition: 'C'
    },

    initCookiePage: (cookieName, hasCondition = false) => {
        let initData = T.cookie(cookieName);
        if (initData[T.cookieKeyName.pageNumber] == null) initData[T.cookieKeyName.pageNumber] = 1;
        if (initData[T.cookieKeyName.pageSize] == null) initData[T.cookieKeyName.pageSize] = 50;
        if (initData[T.cookieKeyName.pageCondition] == null) initData[T.cookieKeyName.pageCondition] = hasCondition ? {} : undefined;
        T.cookie(cookieName, initData);
    },

    updatePage: (cookieName, pageNumber, pageSize, pageCondition) => {
        const updateStatus = {}, oldStatus = T.cookie(cookieName);
        updateStatus[T.cookieKeyName.pageNumber] = pageNumber ? pageNumber : oldStatus[T.cookieKeyName.pageNumber];
        updateStatus[T.cookieKeyName.pageSize] = pageSize ? pageSize : oldStatus[T.cookieKeyName.pageSize];
        updateStatus[T.cookieKeyName.pageCondition] = pageCondition ? pageCondition : oldStatus[T.cookieKeyName.pageCondition];
        T.cookie(cookieName, updateStatus);
        return {
            pageNumber: updateStatus[T.cookieKeyName.pageNumber],
            pageSize: updateStatus[T.cookieKeyName.pageSize],
            pageCondition: JSON.stringify(updateStatus[T.cookieKeyName.pageCondition])
        };
    },

    onResize: () => {
        const marginTop = 6 + $('header').height(),
            marginBottom = 6 + $('footer').height();
        $('.site-content').css('margin', marginTop + 'px 0 ' + marginBottom + 'px 0');
    },

    validateEmail: email => (/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i).test(String(email).toLowerCase()),

    dateToText: (date, format) => dateformat(date, format ? format : 'dd/mm/yyyy HH:MM:ss'),
    numberDisplay: number => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),

    // Libraries ----------------------------------------------------------------------------------
    routeMatcher: routeMatcherLib.routeMatcher,

    notify: (message, type) => $.notify({ message }, { type, placement: { from: 'bottom' }, z_index: 2000 }),

    alert: (text, icon, button, timer) => {
        let options = {};
        if (icon) {
            if (typeof icon == 'boolean') {
                options.button = icon;
                options.icon = 'success';
                if (timer) options.timer = timer;
            } else if (typeof icon == 'number') {
                options.timer = icon;
                options.icon = 'success';
            } else {
                options.icon = icon;
            }

            if (button != undefined) {
                if (typeof button == 'number') {
                    options.timer = options.button;
                    options.button = true;
                } else {
                    options.button = button;
                    if (timer) options.timer = timer;
                }
            } else {
                options.button = true;
            }
        } else {
            options.icon = 'success';
            options.button = true;
        }
        options.text = text;
        swal(options);
    },

    confirm: (title, text, icon, dangerMode, done) => {
        if (typeof icon == 'function') {
            done = icon;
            icon = 'warning';
            dangerMode = false;
        } else if (typeof icon == 'boolean') {
            done = dangerMode;
            dangerMode = icon;
            icon = 'warning';
        } else if (typeof dangerMode == 'function') {
            done = dangerMode;
            dangerMode = false;
        }
        swal({ icon, title, text, dangerMode, buttons: { cancel: true, confirm: true }, }).then(done);
    },

    dateFormat: { format: 'dd/mm/yyyy hh:ii', autoclose: true, todayBtn: true },
    birthdayFormat: { format: 'dd/mm/yyyy', autoclose: true, todayBtn: true },
    formatDate: str => {
        try {
            let [strDate, strTime] = str.split(' '),
                [date, month, year] = strDate.split('/'),
                [hours, minutes] = strTime ? strTime.split(':') : [0, 0];
            return new Date(year, month - 1, date, hours, minutes);
        } catch (ex) {
            return null;
        }
    },

    tooltip: (timeOut = 250) => {
        $(function () {
            setTimeout(() => {
                $('[data-toggle="tooltip"]').tooltip();
            }, timeOut);
        });
    },
};

T.socket = T.debug ? io() : io.connect(T.rootUrl, { secure: true });

T.language = texts => {
    let lg = T.cookie('language');
    if (lg == null || (lg != 'vi' && lg != 'en')) lg = 'vi';
    return texts ? (texts[lg] ? texts[lg] : {}) : lg;
};
T.language.next = () => {
    const language = T.cookie('language');
    return (language == null || language == 'en') ? 'vi' : 'en';
};
T.language.current = () => {
    const language = T.cookie('language');
    return (language == null || language == 'en') ? 'en' : 'vi';
};
T.language.switch = () => {
    const language = T.language.next();
    T.cookie('language', language);
    return { language };
};
T.language.parse = (text, getAll) => {
    let obj = {};
    try { obj = JSON.parse(text) } catch { };
    if (obj.vi == null) obj.vi = text;
    if (obj.en == null) obj.en = text;
    return getAll ? obj : obj[T.language()];
};
T.language.getMonth = () => ({
    vi: ['Tháng một', 'Tháng hai', 'Tháng ba', 'Tháng tư', 'Tháng năm', 'Tháng sáu', 'Tháng bảy', 'Tháng tám', 'Tháng chín', 'Tháng mười', 'Tháng mười một', 'Tháng mười hai'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
}[T.language()]);

T.get2 = x => ('0' + x).slice(-2);
T.socket.on('connect', () => {
    if (T.connected === 0) {
        T.connected = true;
    } else if (T.debug) {
        location.reload();
    }
});
if (T.debug) {
    T.connected = 0;
    T.socket.on('reconnect_attempt', attemptNumber => T.connected = -attemptNumber);
    T.socket.on('debug', type => (type === 'reload') && location.reload());
}

['get', 'post', 'put', 'delete'].forEach(method => T[method] = (url, data, success, error) => {
    if (typeof data === 'function') {
        error = success;
        success = data;
    }
    $.ajax({
        url: T.url(url),
        data,
        type: method.toUpperCase(),
        success: data => success && success(data),
        error: data => {
            console.error('Ajax (' + method + ' => ' + url + ') has error. Error:', data);
            error && error(data)
        }
    })
});


$(() => {
    $(window).resize(T.onResize);
    setTimeout(T.onResize, 100);
});

T.ftcoAnimate = () => {
    $('.ftco-animate').waypoint(function (direction) {
        if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {
            $(this.element).addClass('item-animate');
            setTimeout(function () {
                $('body .ftco-animate.item-animate').each(function (k) {
                    const el = $(this);
                    setTimeout(function () {
                        var effect = el.data('animate-effect');
                        if (effect === 'fadeIn') {
                            el.addClass('fadeIn ftco-animated');
                        } else if (effect === 'fadeInLeft') {
                            el.addClass('fadeInLeft ftco-animated');
                        } else if (effect === 'fadeInRight') {
                            el.addClass('fadeInRight ftco-animated');
                        } else {
                            el.addClass('fadeInUp ftco-animated');
                        }
                        el.removeClass('item-animate');
                    }, k * 50, 'easeInOutExpo');
                });

            }, 100);
        }
    }, { offset: '95%' });
};

export default T;

String.prototype.getText = function () {
    return T.language.parse(this);
};

String.prototype.viText = function () {
    return T.language.parse(this, true).vi;
};

String.prototype.replaceAll = function (search, replacement) {
    return this.replace(new RegExp(search, 'g'), replacement);
};

String.prototype.upFirstChar = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

//Array prototype -----------------------------------------------------------------------------------------------------
Array.prototype.contains = function (...pattern) {
    return pattern.reduce((result, item) => result && this.includes(item), true);
};

Date.prototype.getText = function () {
    return T.language.getMonth()[this.getMonth()] + ' ' + T.get2(this.getDate()) + ', ' + this.getFullYear() + ' ' + T.get2(this.getHours()) + ':' + T.get2(this.getMinutes());
};
Date.prototype.getDateText = function () {
    return T.language.getMonth()[this.getMonth()] + ' ' + T.get2(this.getDate()) + ', ' + this.getFullYear();
};
Date.prototype.getTimeText = function () {
    return T.get2(this.getHours()) + ':' + T.get2(this.getMinutes());
};
Date.prototype.getShortText = function () {
    return this.getFullYear() + '/' + T.get2(this.getMonth() + 1) + '/' + T.get2(this.getDate()) + ' ' + T.get2(this.getHours()) + ':' + T.get2(this.getMinutes());
};
Date.prototype.ddmmyyyy = function () {
    var a = ''
    if (this.getFullYear()) {
        a = this.getFullYear();
        if (this.getMonth()) {
            a = T.get2(this.getMonth() + 1) + '/' + a;
            if (this.getDate())
                a = T.get2(this.getDate()) + '/' + a;
        }
    }
    return a
};
Date.prototype.mmyyyy = function () {
    var a = ''
    if (this.getFullYear()) {
        a = this.getFullYear();
        if (this.getMonth())
            a = T.get2(this.getMonth() + 1) + '/' + a;
    }
    return a
};