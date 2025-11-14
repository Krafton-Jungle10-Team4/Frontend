# 비용 모니터링

## GET /api/v1/cost/usage/{bot_id}
**Get Bot Usage Stats**

특정 봇의 LLM 사용량 및 비용 통계 조회

### Parameters
* **`bot_id`** * (path, string)
* **`start_date`** (query)
    * 시작 날짜 (YYYY-MM-DD)
* **`end_date`** (query)
    * 종료 날짜 (YYYY-MM-DD)
* **`authorization`** (header)

### Responses

**Code 200: Successful Response**
* Media type: `application/json`
* Example Value:
    ```json
    {
      "bot_id": "string",
      "total_requests": 0,
      "total_input_tokens": 0,
      "total_output_tokens": 0,
      "total_tokens": 0,
      "total_cost": 0,
      "period_start": "2025-11-14T05:45:03.749Z",
      "period_end": "2025-11-14T05:45:03.749Z"
    }
    ```

**Code 422: Validation Error**
* Media type: `application/json`
* Example Value:
    ```json
    {
      "detail": [
        {
          "loc": [
            "string",
            0
          ],
          "msg": "string",
          "type": "string"
        }
      ]
    }
    ```

---

## GET /api/v1/cost/usage/{bot_id}/breakdown
**Get Bot Usage Breakdown**

특정 봇의 모델별 사용량 분해

### Parameters
* **`bot_id`** * (path, string)
* **`start_date`** (query)
* **`end_date`** (query)
* **`authorization`** (header)

### Responses

**Code 200: Successful Response**
* Media type: `application/json`
* Example Value:
    ```json
    [
      {
        "provider": "string",
        "model_name": "string",
        "request_count": 0,
        "total_input_tokens": 0,
        "total_output_tokens": 0,
        "total_cost": 0
      }
    ]
    ```

**Code 422: Validation Error**
* Media type: `application/json`
* Example Value:
    ```json
    {
      "detail": [
        {
          "loc": [
            "string",
            0
          ],
          "msg": "string",
          "type": "string"
        }
      ]
    }
    ```

---

## GET /api/v1/cost/usage/{bot_id}/daily
**Get Bot Daily Costs**

특정 봇의 일별 비용 요약

### Parameters
* **`bot_id`** * (path, string)
* **`days`** (query, integer)
    * `maximum: 365`, `minimum: 1`
    * 조회 일수 (최대 365일)
    * `Default value : 30`
* **`authorization`** (header)

### Responses

**Code 200: Successful Response**
* Media type: `application/json`
* Example Value:
    ```json
    [
      {
        "date": "string",
        "request_count": 0,
        "total_tokens": 0,
        "total_cost": 0
      }
    ]
    ```

**Code 422: Validation Error**
* Media type: `application/json`
* Example Value:
    ```json
    {
      "detail": [
        {
          "loc": [
            "string",
            0
          ],
          "msg": "string",
          "type": "string"
        }
      ]
    }
    ```

---

## GET /api/v1/cost/pricing
**Get Model Pricing**

모든 모델의 가격 정보 조회

### Parameters
* **`provider`** (query)
    * Provider 필터

### Responses

**Code 200: Successful Response**
* Media type: `application/json`
* Example Value:
    ```json
    [
      {
        "provider": "string",
        "model_name": "string",
        "input_price_per_1k": 0,
        "output_price_per_1k": 0,
        "cache_write_price_per_1k": 0,
        "cache_read_price_per_1k": 0,
        "region": "string"
      }
    ]
    ```

**Code 422: Validation Error**
* Media type: `application/json`
* Example Value:
    ```json
    {
      "detail": [
        {
          "loc": [
            "string",
            0
          ],
          "msg": "string",
          "type": "string"
        }
      ]
    }
    ```