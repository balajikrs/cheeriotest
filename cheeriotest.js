const axios = require('axios');
const cheerio = require('cheerio');
const { each } = require('cheerio/lib/api/traversing');
const fs =require('fs');

const baseUrl =  'https://masstamilan.fm';

let album = '/karnan-songs';
let pageNo = 12;

const getSongs = async (baseUrl,pathParams) => {
	try {
		const { data } = await axios.get(baseUrl + pathParams);
		const $ = cheerio.load(data);
		const postTitles = [];

		// $('#tlist > tbody > tr > td').each((_idx, el) => {
        // console.log($('#tlist > tbody > tr:nth-child(2) > td:nth-child(1) > span:nth-child(2) > h2 > span > a').text());
        // for (let i = 2; i < 8;i++){
        //     console.log($(`'#tlist > tbody > tr:nth-child(2) > td:nth-child(1) > span:nth-child(${i}) > h2 > span > a'`).text());
        // }
        let sngList = [];
        let sngObj = null;
        $('#tlist > tbody > tr').each(function () {
            $('td', this).each(function () {
                $('span > h2 > span > a', this).each(function () {
                    let value = $(this).text();
                    let sngUrl = $(this).prop('href');
                    sngObj = {"sngName" : value, "sngUrl":sngUrl};
                    // console.log(value);
                })
                if(sngObj){

                    $('span > span.dl-count', this).each(function () {
                        let value = $(this).text();
                        sngObj.dnldCnt = Number(value);
                        // console.log(value);
                    })
                    $('a.dlink.anim.umami--click--dl128', this).each(function () {
                        let dwnld128Url = $(this).prop('href');
                        sngObj.dwnld128Url = dwnld128Url;
                        // console.log(dwnld128Url);
                    })
                    // $('a.dlink anim umami--click--dl320', this).each(function () {
                    //     let dwnld320Url = $(this).prop('href');
                    //     sngObj.dwnld320Url = dwnld320Url;
                    //     console.log(dwnld320Url);
                    // })

                    // push only if previous song object is not same 
                    // console.log(sngList.length);
                    if (sngList.length > 0){
                        const prevSng = sngList[sngList.length-1].sngName;
                        const currSng = sngObj.sngName;
                        // console.log("Current song :",currSng);
                        // console.log("Prev song :",prevSng);
                        if (prevSng !== currSng){
                            sngList.push(sngObj);
                        }
                    }
                    else{
                        sngList.push(sngObj);
                    }
                }
            })
        })
        // console.log(sngList);

		// $('#tlist > tbody > tr:nth-child(2) > td[1] > span[2] > h2 > span > a').each((_idx, el) => {
        //     console.log(el,idx);
		// 	const postTitle = $(el).text();
        //     // console.log(postTitle);
		// 	if (postTitle != '\n' || '') {
        //         postTitles.push(postTitle);
        //     } 
		// });

        // $('.numberOfItems tr td[id]').each(function(){
        //     var tdID = $(this).attr('id'); // <--- getting the ID here
        //     var result = tdID.text(); // <--- doing something
        //     $(this).html(result);  // <---- updating the HTML inside the td
        //   });
        // console.log("sngList : ",sngList);
		return sngList;
	} catch (error) {
		throw error;
	}
};

async function getMoviesInPage (baseUrl,pageParam) {
	try {
		const { data } = await axios.get(baseUrl + '/tamil-songs?page=' + pageParam);
		const $ = cheerio.load(data);
		const postTitles = [];

        // console.log($('body > div.box.cen > section.bots.ib > div').text());
        
        let movieList = [];
        let movieObj = null;
        $('body > div.box.cen > section.bots.ib > div').each(function () {
            $('div.a-i', this).each(function () {
                $('a', this).each(function () {
                    let title = $(this).prop('title');
                    let movieUrl = $(this).prop('href');
                    movieObj = {"movieTitle" : title, "movieUrl":movieUrl};
                    // console.log(title);
                })
                if(movieObj){
                    movieList.push(movieObj);
                }
            })
        })
        // console.log(sngList);

		return movieList;
	} catch (error) {
		throw error;
	}
};

const addSongToMovie = async (movies) => {
    // console.log(movies.length);
    let opvar = [];

    for (const movie of movies) {
        const content =await getSongs(baseUrl,movie.movieUrl).catch((error) => console.log(error));
        movie.songList = content;
        fs.writeFile('songs.json', JSON.stringify(movie)+'\n', { flag: 'a+' }, err => {console.error(err);})

        // console.log(typeof content);
      }
    // for each is not working with async function as the iteration is not happening async ly
    // read this https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
    // https://2ality.com/2016/10/asynchronous-iteration.html
    // movies.forEach(element => {
    //     console.log(element);
    //     opvar = await getSongs(baseUrl,element.movieUrl).catch((error) => console.log(error));
    //     console.log(opvar);
    // });
    let moviesWithSng = [];
    let songList = {};
    // for (let movie in movies){

    //     movies[movie]
    //     songList.songs = await getSongs(baseUrl,album).catch((error) => console.log(error));
    //     // console.log(movie.songList);
    //     // console.log(typeof movie);
    //     // moviesWithSng.push(movie);
    //     // .then((postTitles) => console.log(postTitles,postTitles.length));
    // }
    return moviesWithSng;

}

const start = async () => {

    // let album = '/jai-bhim-songs';
    
    const movies = await getMoviesInPage(baseUrl,pageNo).catch((error)=>console.log(error));
    // console.log("movies:",movies);
    const moviesWithSng = await addSongToMovie(movies).catch((error)=>console.log(error));
    // console.log("moviesWithSng:",moviesWithSng);
    
    
}

start();