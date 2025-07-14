const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const host = '0.0.0.0';

app.use(express.json());
app.use(express.static('public'));

// Lưu data trực tiếp trong biến thay vì đọc file
const API_DATA = [
  {
    "wardId": 10259,
    "accesstoken": "5e801824-8f05-40c8-932b-f8c780ba42dc",
    "authorization": "Bearer 9F2EE1DBECBA216DBA5A4E7879C8C7C8",
    "customer-id": "1016033940",
    "deviceid": "46b6d115-2a3a-4597-bede-b8a89c7c8ae3",
    "devicetoken": "NTZmYTI4MWJkZDQxYWNhNDIyNWYwMzY4YjhhMzY1NWU=",
    "username": "0327392104"
  },
  {
    "wardId": 10394,
    "accesstoken": "295e427c-efbb-427b-aa08-c2c8089c054d",
    "authorization": "Bearer 7B1EFA43EA6BB018F554C157703D1DD4",
    "customer-id": "1135824412",
    "deviceid": "b1ec2cd6-51e8-4d74-bad0-216871115faa",
    "devicetoken": "ZjdkNTI0MGZkMTY2ODNlYTBiYjc1M2EzOGJlOWMxMDA=",
    "username": "0941195459"
  },
  {
    "wardId": 10300,
    "accesstoken": "937ecab4-a560-44f3-b4a3-3a1bfbb16045",
    "authorization": "Bearer C459C2800E32823BE7873A6C6D592E44",
    "customer-id": "1116925107",
    "deviceid": "87625f53-9434-456f-b50c-2a3dabc7b151",
    "devicetoken": "MzgwZDg0NjUwMTQ0MDlmNDM2YzVlMzNiNzAxN2YxYTA=",
    "username": "0764849348"
  },
   {
    "wardId": 10259,
    "accesstoken": "ddfb632b-a15b-4288-9106-c1bd6c353774",
    "authorization": "Bearer 9379971206DD0B954458C282D770D566",
    "customer-id": "1105485254",
    "deviceid": "00c0adb8-5126-4617-b0cb-e7f289d06073",
    "devicetoken": "YmZlMTM4YmMwOTlhNjhmYWNhM2UyNGRjMDJhMTk2ODQ=",
    "username": "0568678704"
  },
   {
    "wardId": 10259,
    "accesstoken": "b1f147f1-f04c-43bb-8cad-233989377f36",
    "authorization": "Bearer A61DEA67472F4192B1A58CE0237C6C24",
    "customer-id": "1109342324",
    "deviceid": "46b40e45-9a50-4280-a650-b48974979e65",
    "devicetoken": "NTEwNzcwYzk0ZDI0NGJiYzdlMzFkMDhhMWM4YTI3YTA=",
    "username": "0346493309"
  },
   {
    "wardId": 10259,
    "accesstoken": "fc0751f2-f097-452f-8f0e-596785b39251",
    "authorization": "Bearer 7C81F355F3A36E470164B3F5D4DE9FB7",
    "customer-id": "1086824852",
    "deviceid": "6f71a141-ba0c-438b-ad30-cd6a73bde9cc",
    "devicetoken": "ZmMxYzI2MmU2YmQ3YTk0M2Q0OTJkZjMwNzkxZWY2NWQ=",
    "username": "0911725376"
  },
   {
    "wardId": 10259,
    "accesstoken": "a9941ba4-4562-4030-af35-b0e5144863ae",
    "authorization": "Bearer 2D685B5CE3106EC81BF3BA01D394F543",
    "customer-id": "1090061519",
    "deviceid": "0a815bc8-885e-4d00-8d3f-ec46b34c7e9a",
    "devicetoken": "NjE1NzFjZmI0YzNkNjczZTE5ZWFjNjM3ZGEzZWZkMTA=",
    "username": "0396208270"
  }
];

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
  
  console.log('=== API CALL START ===');
  console.log('GameId:', gameId);
  console.log('Total records:', API_DATA.length);
  
  if (!gameId || (gameId !== 36 && gameId !== 37)) {
    return res.status(400).json({ error: 'gameId phải là 36 hoặc 37' });
  }

  // Thiết lập Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
    'X-Accel-Buffering': 'no',
    'Transfer-Encoding': 'chunked'
  });

  // Gửi heartbeat ngay lập tức
  res.write(': connected\n\n');

  // Heartbeat để duy trì kết nối
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15000);

  // Cleanup khi client disconnect
  req.on('close', () => {
    console.log('Client disconnected');
    clearInterval(heartbeat);
  });

  req.on('error', (err) => {
    console.error('Request error:', err);
    clearInterval(heartbeat);
  });

  try {
    // Sử dụng biến API_DATA thay vì đọc file
    const dataList = API_DATA;
    
    if (!dataList || dataList.length === 0) {
      throw new Error('Không có dữ liệu để xử lý');
    }
    
    console.log('Processing', dataList.length, 'records');
    
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

    clearInterval(heartbeat);
    console.log('=== API CALL COMPLETE ===');

  } catch (error) {
    console.error('Processing error:', error);
    clearInterval(heartbeat);
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

// Cấu hình timeout cho Render.com
const server = app.listen(port, host, () => {
  console.log(`Server đang chạy tại http://${host}:${port}`);
  console.log(`Loaded ${API_DATA.length} API records`);
});

// Tăng timeout values
server.keepAliveTimeout = 120000;
server.headersTimeout = 120000;
server.timeout = 120000;
