import fs from 'fs';
import path from 'path';
import driver from 'node-phantom-simple';
import { lanesprops } from '../src/Stage/Level01/props';
import resolutionsdata from '../src/Utils/resolutions.data';

import { path2js, scalejspath, jsToSVGPath } from '../src/Utils/svg';

driver.create({ path: require('phantomjs-prebuilt').path }, function (err, browser) {

    return browser.createPage(function (err, page) {

        var resultspromises = resolutionsdata.map(function(resolution) {

            var scaledpathes = lanesprops.map(function(laneprops) {
                var svgpath = laneprops.path;
                
                var xratio = resolution.width / laneprops.width;
                var yratio = resolution.height / laneprops.height;

                if(xratio !== 1 || yratio !== 1) {
                    svgpath = jsToSVGPath(scalejspath(path2js(svgpath), yratio, yratio, resolution.offsetx, resolution.offsety));   // yratio utilisé à la place de xratio : les différents ratios de cartes utilisent la hauteur comme dimension commune
                }

                return svgpath;
            });

            var promises = scaledpathes.map(function(svgpath) {
                return new Promise(function(resolve, reject) {
                    page.evaluate(function(svgpath) {

                        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        path.setAttribute('d', svgpath);
                        var totallength = Math.floor(path.getTotalLength());

                        var memoized = [];

                        for(var walked = 0; walked < totallength; walked++) {
                            var point = path.getPointAtLength(walked);
                            memoized.push([parseFloat(point.x.toFixed(2)), parseFloat(point.y.toFixed(2))]);
                        }

                        return {
                            length: totallength,
                            points: memoized
                        };

                    }, svgpath, function(err, result) {
                        if(err) reject(err);
                        resolve(result);
                    });
                });
            });

            return Promise.all(promises).then(function(results) {
                return {
                    resolution: resolution,
                    results: results
                };
            });
        });

        Promise.all(resultspromises)
        .then(function(jobdata) {
            jobdata.map(function(data) {
                var filepath = __dirname + '/../public/assets/compiled/level1.' + data.resolution.width + 'x' + data.resolution.height + '.json';
                fs.writeFileSync(filepath, JSON.stringify(data.results));
                console.log(filepath);
            });
        })
        .then(function() {
            browser.exit();
        }).catch(function(err) {
            console.log('ERROR', err);
            browser.exit();
        });
        /*
        return page.open("http://tilomitra.com/build-something/", function (err,status) {

            console.log("opened site? ", status);

            page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function (err) {

                // jQuery Loaded.
                // Wait for a bit for AJAX content to load on the page. Here, we are waiting 5 seconds.

                //setTimeout(function () {
                    return page.evaluate(function () {
                        //Get what you want from the page using jQuery. A good way is to populate an object with all the jQuery commands that you need and then return the object.
                        var h2Arr = [],
                        pArr = [];

                        $('h2').each(function () { h2Arr.push($(this).html()); });
                        $('p').each(function () { pArr.push($(this).html()); });

                        return {
                            h2: h2Arr,
                            p: pArr
                        };
                    }, function (err,result) {
                        console.log(result);
                        browser.exit();
                    });
                //}, 5000);
            });
        });
        */
    });
});