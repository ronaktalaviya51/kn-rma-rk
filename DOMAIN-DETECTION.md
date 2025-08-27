    # Domain 偵測與管理功能

    ## 🌍 功能概述

    KN RMA 系統現在支援自動偵測和管理來自不同 domain 的請求，包括：

    - **自動 IP 偵測**：支援 localhost、IP 地址
    - **動態 Domain 允許**：支援 `https://example.com`、`http://test.local` 等
    - **CORS 自動設定**：動態允許合法的 domain
    - **即時管理**：透過 API 即時新增/測試 domain

    ## 🔧 如何運作

    ### 1. Domain 偵測方式

    系統會從 HTTP 請求中偵測 domain：

    ```javascript
    // 方法1: 從 Origin header (最準確)
    origin: "https://myapp.com"

    // 方法2: 從 Referer header
    referer: "https://myapp.com/page"

    // 方法3: 從 Host header + protocol
    host: "myapp.com"
    x-forwarded-proto: "https"
    ```

    ### 2. 自動 CORS 允許

    系統會自動允許以下類型的 domain：

    - ✅ `http://localhost:*`
    - ✅ `http://127.0.0.1:*`
    - ✅ `http://192.168.*.*:*`
    - ✅ `http://10.*.*.*:*`
    - ✅ `http://172.*.*.*:*`
    - ✅ 環境變數指定的 domain
    - ✅ 動態新增的 domain

    ### 3. 開發環境自動學習

    在開發環境中，系統會自動學習新的 domain：

    ```javascript
    // 開發環境中首次請求時
    Request from: "https://newdomain.com"
    → 自動新增到允許清單
    → 後續請求直接允許
    ```

    ## 🚀 使用方式

    ### 環境變數設定

    在 `.env` 檔案中設定允許的 domains：

    ```bash
    # 允許的 domains (用逗號分隔)
    ALLOWED_DOMAINS=https://example.com,https://app.example.com,http://test.local

    # 自訂 CORS origins  
    CUSTOM_ORIGINS=https://cdn.example.com,https://api.example.com
    ```

    ### API 管理

    #### 1. 獲取允許的 domains

    ```bash
    GET /api/cors/allowed-domains

    Response:
    {
      "success": true,
      "data": {
        "domains": [
          "http://localhost:8080",
          "https://myapp.com"
        ],
        "count": 2
      }
    }
    ```

    #### 2. 新增 domain

    ```bash
    POST /api/cors/allowed-domains
    Content-Type: application/json

    {
      "domain": "https://newapp.com"
    }

    Response:
    {
      "success": true,
      "message": "Domain https://newapp.com added successfully"
    }
    ```

    #### 3. 測試 domain

    ```bash
    POST /api/cors/test-domain
    Content-Type: application/json

    {
      "domain": "https://testapp.com"
    }

    Response:
    {
      "success": true,
      "data": {
        "domain": "https://testapp.com",
        "allowed": false
      }
    }
    ```

    #### 4. 獲取統計資訊

    ```bash
    GET /api/cors/domain-stats

    Response:
    {
      "success": true,
      "data": {
        "totalAllowedDomains": 5,
        "lastUpdated": "2025-07-04T10:00:00.000Z"
      }
    }
    ```

    ## 📱 前端整合

    ### 1. 使用 Domain Manager 元件

    ```vue
    <template>
      <DomainManager />
    </template>

    <script>
    import DomainManager from '@/components/DomainManager.vue'

    export default {
      components: {
        DomainManager
      }
    }
    </script>
    ```

    ### 2. 程式化管理

    ```javascript
    import api from '@/services/api'

    // 新增 domain
    await api.post('/api/cors/allowed-domains', {
      domain: 'https://mynewapp.com'
    })

    // 測試 domain
    const result = await api.post('/api/cors/test-domain', {
      domain: 'https://testapp.com'
    })

    console.log('Domain allowed:', result.data.allowed)
    ```

    ## 🔒 安全性考量

    ### 1. 生產環境設定

    在生產環境中，建議：

    ```bash
    # 明確指定允許的 domains
    ALLOWED_DOMAINS=https://yourdomain.com,https://app.yourdomain.com

    # 關閉自動學習
    NODE_ENV=production
    ```

    ### 2. Domain 驗證

    系統會驗證 domain 格式：

    ```javascript
    // ✅ 有效的 domain
    "https://example.com"
    "http://test.local:3000"

    // ❌ 無效的 domain  
    "not-a-url"
    "ftp://example.com"
    ```

    ### 3. 日誌記錄

    所有 domain 訪問都會被記錄：

    ```javascript
    info: Domain Access: {
      "origin": "https://example.com",
      "allowed": true,
      "ip": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2025-07-04T10:00:00.000Z"
    }
    ```

    ## 🧪 測試

    ### 1. 使用測試腳本

    ```bash
    # 執行 domain 測試
    node test-domain.js
    ```

    ### 2. 手動測試

    ```bash
    # 測試 CORS 預檢
    curl -X OPTIONS \
      -H "Origin: https://example.com" \
      -H "Access-Control-Request-Method: GET" \
      http://localhost:3000/api/rma/requests

    # 測試實際請求
    curl -X GET \
      -H "Origin: https://example.com" \
      http://localhost:3000/api/cors/allowed-domains
    ```

    ## 🔧 故障排除

    ### 1. CORS 錯誤

    如果遇到 CORS 錯誤：

    ```bash
    # 檢查 domain 是否被允許
    curl -X POST http://localhost:3000/api/cors/test-domain \
      -H "Content-Type: application/json" \
      -d '{"domain": "https://yourdomain.com"}'

    # 新增 domain 到允許清單
    curl -X POST http://localhost:3000/api/cors/allowed-domains \
      -H "Content-Type: application/json" \
      -d '{"domain": "https://yourdomain.com"}'
    ```

    ### 2. 查看日誌

    ```bash
    # 查看 domain 訪問日誌
    docker-compose logs backend | grep "Domain Access"

    # 查看 CORS 相關日誌
    docker-compose logs backend | grep "CORS"
    ```

    ### 3. 重置設定

    ```bash
    # 重新啟動服務
    docker-compose restart backend

    # 重新載入環境變數
    npm run setup
    docker-compose up -d
    ```

    ## 📖 範例場景

    ### 場景 1: 開發環境

    ```bash
    # 開發者在 localhost:3000 開發前端
    # 系統自動允許 http://localhost:3000

    # 後來改到 http://127.0.0.1:3000
    # 系統自動學習並允許
    ```

    ### 場景 2: 測試環境

    ```bash
    # 部署到 https://test.myapp.com
    # 管理員透過 API 新增:
    curl -X POST http://api.myapp.com/api/cors/allowed-domains \
      -H "Content-Type: application/json" \
      -d '{"domain": "https://test.myapp.com"}'
    ```

    ### 場景 3: 生產環境

    ```bash
    # 在 .env 中預先設定:
    ALLOWED_DOMAINS=https://myapp.com,https://app.myapp.com

    # 系統啟動時自動載入
    ```

    ## 📚 更多資源

    - [CORS MDN 文檔](https://developer.mozilla.org/docs/Web/HTTP/CORS)
    - [Express CORS 中間件](https://github.com/expressjs/cors)
    - [Vue.js Axios 設定](https://axios-http.com/docs/config_defaults)
