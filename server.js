const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

async function callGetRewardAPIForRecord(item, gameId, onProgress) {
  const url = 'https://apibhx.tgdd.vn/Game/GetReward';
  const baseHeaders = {
    'accept': 'application/json, text/plain, */*',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'en-US,en;q=0.9',
    'access-control-allow-origin': '*',
    'content-type': 'application/json',
    'origin': 'https://www.bachhoaxanh.com',
    'platform': 'webnew',
    'priority': 'u=1, i',
    'referer': 'https://www.bachhoaxanh.com/game/ngay-10-luong-ve',
    'referer-url': 'https://www.bachhoaxanh.com/game/ngay-10-luong-ve',
    'reversehost': 'http://bhxapi.live',
    'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
    'xapikey': 'bhx-api-core-2022'
  };

  const headers = {
    ...baseHeaders,
    'accesstoken': item.accesstoken,
    'authorization': item.authorization,
    'customer-id': item['customer-id'],
    'deviceid': item.deviceid,
    'devicetoken': item.devicetoken,
    'username': item.username
  };

  const payload = {
    fromapp: 'mwg-game-web-bhx',
    locationInfo: {},
    gameId: gameId,
    typeId: 1,
    wardId: item.wardId
  };

  console.log(`Bắt đầu xử lý wardId: ${item.wardId}, username: ${item.username}, gameId: ${gameId}`);

  for (let i = 1; i <= 5; i++) {
    try {
      const response = await axios.post(url, payload, { headers });
      
      // Gọi callback để cập nhật progress
      onProgress({
        wardId: item.wardId,
        username: item.username,
        gameId: gameId,
        attempt: i,
        status: 'processing',
        timestamp: new Date().toISOString()
      });

      if (response.data.data && response.data.data.status == 2) {
        console.log(`THÀNH CÔNG tại lần gọi thứ ${i} với wardId: ${item.wardId}, username: ${item.username}`);
        return {
          wardId: item.wardId,
          username: item.username,
          gameId: gameId,
          attempt: i,
          success: true,
          message: `Thành công tại lần thử thứ ${i}`,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error(`Lỗi khi gọi API lần ${i} với wardId ${item.wardId}:`, error.response ? error.response.data : error.message);

      if (error.response && error.response.status === 429) {
        console.log(`DỪNG tại lần gọi thứ ${i} với wardId: ${item.wardId} vì lỗi quá nhiều yêu cầu (429)`);
        return {
          wardId: item.wardId,
          username: item.username,
          gameId: gameId,
          attempt: i,
          success: false,
          error: 'Quá nhiều yêu cầu (429)',
          timestamp: new Date().toISOString()
        };
      }
    }

    // Giảm delay xuống 200ms để nhanh hơn khi chạy song song
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return {
    wardId: item.wardId,
    username: item.username,
    gameId: gameId,
    attempt: 100,
    success: false,
    message: 'Đã thử 100 lần nhưng không thành công',
    timestamp: new Date().toISOString()
  };
}

// API endpoint với xử lý song song
app.get('/api/run-game/:gameId', async (req, res) => {
  const gameId = parseInt(req.params.gameId);
  
  if (!gameId || (gameId !== 36 && gameId !== 37)) {
    return res.status(400).json({ error: 'gameId phải là 36 hoặc 37' });
  }

  // Thiết lập Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  try {
    const apiData = await fs.readFile('apiData.json', 'utf8');
    const dataList = JSON.parse(apiData);
    
    const results = [];
    let completedCount = 0;

    // Hàm callback để gửi progress
    const onProgress = (progress) => {
      res.write(`data: ${JSON.stringify({
        type: 'progress',
        data: progress
      })}\n\n`);
    };

    // Hàm xử lý kết quả từng item
    const processItem = async (item) => {
      const result = await callGetRewardAPIForRecord(item, gameId, onProgress);
      results.push(result);
      completedCount++;

      // Gửi kết quả ngay khi hoàn thành
      res.write(`data: ${JSON.stringify({
        type: 'result',
        data: result,
        progress: {
          completed: completedCount,
          total: dataList.length
        }
      })}\n\n`);

      return result;
    };

    // **CHẠY SONG SONG TẤT CẢ RECORDS**
    console.log(`Bắt đầu chạy song song ${dataList.length} records...`);
    await Promise.all(dataList.map(item => processItem(item)));

    // Gửi kết quả cuối cùng
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      data: {
        gameId: gameId,
        results: results,
        successCount: results.filter(r => r.success).length,
        totalCount: results.length
      }
    })}\n\n`);

  } catch (error) {
    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: error.message
    })}\n\n`);
  }

  res.end();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
