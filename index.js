
/**
 * Same Image Url
 * 
 * <img class="load-in-viewport" 
 * src="http://static.jabong.com/cms/new-site//K0486-Home-Main-Slider-1-Flash-Sale- Extra 20-off_on-Accessories-25042017_desktop_1493094128726.jpg" 
 * data-src-320="http://static.jabong.com/cms/new-site//Accessories-Extra20-ACC20-MobileSlider-480x242_mweb_1493094142609.jpg" 
 * data-src-500="http://static.jabong.com/cms/new-site//Accessories-Extra20-ACC20-MobileSlider-480x242_mweb_1493094142609.jpg" 
 * data-src-768="http://static.jabong.com/cms/new-site//K0486-Home-Main-Slider-1-Flash-Sale- Extra 20-off_on-Accessories-25042017_desktop_1493094128726.jpg" 
 * data-src-1024="http://static.jabong.com/cms/new-site//K0486-Home-Main-Slider-1-Flash-Sale- Extra 20-off_on-Accessories-25042017_desktop_1493094128726.jpg" 
 * data-src-1280="http://static.jabong.com/cms/new-site//K0486-Home-Main-Slider-1-Flash-Sale- Extra 20-off_on-Accessories-25042017_desktop_1493094128726.jpg" 
 * />
 * 
 *  OR
 * 
 * <img 
 * src="http://static1.jassets.com/p/Lee-Cooper-Tan-Loafers-3770-063106-1-catalog_s.jpg" 
 * data-img-host="http://static1.jassets.com/p/" 
 * class="primary-image thumb loaded" 
 * data-img-config="{
 * 	"320":"-catalog_xs.jpg",
 * 	"500":"-catalog_xs.jpg",
 * 	"768":"-catalog_s.jpg",
 * 	"1024":"-catalog_m.jpg",
 * 	"1280":"-catalog_s.jpg",
 * 	"1600":"-catalog_s.jpg",
 * 	"base_path":"http://static1.jassets.com/p/Lee-Cooper-Tan-Loafers-3770-063106-1"}">
 * 
 * 
 * 
 */


console.time('Total time');
var $ = require('cheerio');
var request = require('request');
var Promise = require('bluebird');
var Fetch = require('request-promise');
var colors = require('colors');

var args = process.argv;

if (!args[2]) {
    console.log('---------------------------------------'.red);
    console.error("Please provide a valid url i.e. http://www.jabong.com".red);
    console.log('---------------------------------------'.red);
    return;
}

request.get(args[2], function(err, response, body) {
    var success = 0;
    var fail = 0;
    var content = $(body);
    var images = content.find('.load-in-viewport');
    var collection = Object.keys(images).reduce((acc, currentVal) => {
        images[currentVal].attribs && images[currentVal].attribs['data-src-320'] && acc.push(images[currentVal].attribs['data-src-320']);
        images[currentVal].attribs && images[currentVal].attribs['data-src-500'] && acc.push(images[currentVal].attribs['data-src-500']);
        images[currentVal].attribs && images[currentVal].attribs['data-src-768'] && acc.push(images[currentVal].attribs['data-src-768']);
        images[currentVal].attribs && images[currentVal].attribs['data-src-1024'] && acc.push(images[currentVal].attribs['data-src-1024']);
        images[currentVal].attribs && images[currentVal].attribs['data-src-1280'] && acc.push(images[currentVal].attribs['data-src-1280']);
        images[currentVal].attribs && images[currentVal].attribs['data-src-1600'] && acc.push(images[currentVal].attribs['data-src-1600']);
        images[currentVal].attribs && images[currentVal].attribs['data-img-config'] && addImageUrl(acc, images[currentVal].attribs['data-img-config']);
        return acc;
    }, []);

    function addImageUrl(acc, _imgConfig) {
        if (!_imgConfig) {
            return acc;
        }
        _imgConfig = JSON.parse(_imgConfig);
        for (let key in _imgConfig) {
            if (!isNaN(parseInt(key))) {
                acc.push(_imgConfig.base_path + _imgConfig[key]);
            }
        }
        return acc;
    }

    //   collection.push('http://static.jabong.com/cms/new-site//K0400_Home-Fashion-Trends-Mens_17042017_mweb_149242176.jpg');

    return Promise.reduce(collection, (acc, url) => {
            if (!url) {
                return acc;
            }
            url = url.replace('.jpg', '.webp');
            let option = {
                uri: url,
                resolveWithFullResponse: true
            };
            return Fetch(option)
                .then((response) => {
                    if (response.statusCode === 200) {
                        console.log(`${url} ${response.statusCode}`.green);
                        success++;
                    }
                    acc[url] = response.statusCode;
                    return acc;
                })
                .error((err) => {
                    acc[url] = err.statusCode;
                    fail++;
                    console.log(`${err.options.uri} ${err.statusCode}`.red);
                    return acc;
                })
                .catch((err) => {
                    fail++;
                    console.log(`${err} ${err.statusCode}`.red);
                    return acc;
                });
        }, {})
        .then((data) => {
            console.log('******************* Report - Start *********************\n\n'.blue);
            console.log(`Total images ${collection.length}`);
            console.log(`Total 200 Ok => ${success}`.green);
            console.log(`Total 404 Not Found => ${fail}`.red);
            console.timeEnd('Total time');
            console.log('\n\n******************* Report - End *********************'.blue);
        })
        .catch(err => console.log(`${err}`.red));
});
