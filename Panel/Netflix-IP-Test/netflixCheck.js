let params = getParams($argument)
const BASE_URL = 'https://www.netflix.com/title/'

const FILM_ID = 81215567
const AREA_TEST_FILM_ID = 80018499

;(async () => {
  let result = {
    title: params.title,
    icon: params.icon4,
	  "icon-color":params.color4,
    content: '測試失敗，請檢查網路連線',
  }

  await test(FILM_ID)
    .then((code) => {
      if (code === 'Not Found') {
        return test(AREA_TEST_FILM_ID)
      }

      result['icon'] = params.icon1
	    result['icon-color'] = params.color1
      result['content'] = '目前 IP 可完整收看 Netflix 影劇\n解鎖區域：' + code.toUpperCase()
      return Promise.reject('BreakSignal')
    })
    .then((code) => {
      if (code === 'Not Found') {
        return Promise.reject('Not Available')
      }

      result['icon'] = params.icon2
	    result['icon-color'] = params.color2
      result['content'] = '目前 IP 僅支援收看 Netflix 自製劇\n解鎖區域：' + code.toUpperCase()
      return Promise.reject('BreakSignal')
    })
    .catch((error) => {
      if (error === 'Not Available') {
        result['icon'] = params.icon3
	      result['icon-color'] = params.color3
        result['content'] = 'Netflix 不為此 IP 提供服務'
        return
      }
    })
    .finally(() => {
      $done(result)
    })
})()

function test(filmId) {
  return new Promise((resolve, reject) => {
    let option = {
      url: BASE_URL + filmId,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
      },
    }
    $httpClient.get(option, function (error, response, data) {
      if (error != null) {
        reject('Error')
        return
      }

      if (response.status === 403) {
        reject('Not Available')
        return
      }

      if (response.status === 404) {
        resolve('Not Found')
        return
      }

      if (response.status === 200) {
        let url = response.headers['x-originating-url']
        let region = url.split('/')[3]
        region = region.split('-')[0]
        if (region == 'title') {
          region = 'us'
        }
        resolve(region)
        return
      }

      reject('Error')
    })
  })
}

function getParams(param) {
  return Object.fromEntries(
    $argument
      .split("&")
      .map((item) => item.split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
}
