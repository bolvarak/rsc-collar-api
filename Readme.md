# RSC Dog Collar API
* Imagine you’ve been assigned to work with a new dog collar. This collar will communicate directly with a cloud infrastructure that you will be developing. The collar will report the dogs physical activity, barking and location in individual JSON payloads. You can define what these payloads look like.
* Please document, endpoints where the collar’s payloads will be received. Also, provide endpoints for future service’s to consume the collar’s data. Don’t worry about the particulars of future consumers—just document the implementation of the service. Once you’ve documented the API endpoints, please implement one endpoint of your choosing. The only requirement of this endpoint is that it must utilize AWS DynamoDB. Please architect this endpoint as if you were going to flesh out the rest of the service later.

## Embedded Device Access

#### Authentication
Authentication will be via the MAC address of the device, this should be recorded and stored when the device is registered and can be one of the following:
* Dog Collar (For direct communications)
* Client Device such as a cell phone (For proxied communications)

The headers should also include the specific animal ID.

###### Raw
```
X-RSC-Device-ID:  1A:46:22:32:C6:D5
X-RSC-Animal-ID:  3c259a6e-7ee2-4edf-b183-e688997d8575
```

##### Response
A simple `success` node will be returned for each request depending on success (`true` for success, `false` for failure.  An `error` node will be returned with a description of the error should an error occur.  NOTE:  If an error occurs the HTTP response header will be returned respectively.

###### Raw
```json
{
	"success": false,
	"error":  "Invalid parameter type"
}
```

###### Description
| Parameter | Type    | Description                                                          |
| ---------------------- | ------- | -------------------------------------------------------------------- |
| success                | Boolean | `true` for successful, `false` for not                               |
| error                  | String  | This parameter will contain a description of the error that occurred |

| HTTP Code | Description                                                          |
| --------- | -------------------------------------------------------------------- |
| 200       | Everything went well                                                 |
| 400       | Bad Request (Missing parameter(s) or invalid parameter(s) type       |
| 401       | Unauthorized, your authentication credentials were invalid           |
| 404       | The endpoint could not be found                                      |
| 500       | A non-recoverable server error occurred                              |



#### `POST /collar/activity.json`
This endpoint is responsible for receiving the animal's physical activity including:
* Speed (Rate of Movement)
* Heart Rate
* Time Movement Started
* Time Movement Stopped

##### Payload

###### Raw
```json
{
	"endTime": 1526069756,
	"heartRate": 80.00,
	"rateOfMovement": 0.256,
	"startTime": 1526068986,
}
```

###### Description
| Parameter      | Type    | Description                                                                                         |
| -------------- | ------- | --------------------------------------------------------------------------------------------------- |
| endTime        | Integer | This parameter contains a UNIX Timestamp for the end of the active session                          |
| heartRate      | Float   | This parameter contains the heart rate (BPM) of the animal during the active session                |
| rateOfMovement | Float   | This parameter contains the rate of the animal's movement (meters/second) during the active session |
| startTime      | Integer | This parameter contains a UNIX timestamp for the start of the active session                        |



#### `POST /collar/bark.json`
This endpoint is responsible for tracking the animal's bark activity, including:
* Bark Level
* Location Bark Occurred
* Heart Rate

#### Payload

###### Raw
```json
{
	"heartRate": 80.0,
	"level": 1.0,
	"location": {
		"type": "Feature",
		"geometry": {
			"type": "Point",
			"coordinates": [-77.0364, 38.8951]
		}
	},
	"timeStamp": 1526069756
}
```

###### Description
| Parameter      | Type    | Description                                                                        |
| -------------- | ------- | ---------------------------------------------------------------------------------- |
| heartRate      | Float   | This parameter contains the heart rate (BPM) of the animal during the bark session |
| level          | Float   | This parameter contains the average decibal of the bark during the bark session    |
| location       | GeoJSON | This parameter contains the coordinates in which the bark session occurred         |
| timeStamp      | Integer | This parameter contains a UNIX timestamp of when the bark session occurred         |




#### `POST /collar/location.json`
This endpoint is responsible for tracking the location of the animal

##### Payload

###### Raw
```json
{
	"location": {
		"type": "Feature",
		"geometry": {
			"type": "Point",
			"coordinates": [-77.0364, 38.8951]
		}
	},
	"timeStamp": 1526069756
}
```

###### Description
| Parameter      | Type    | Description                                                                    |
| -------------- | ------- | ------------------------------------------------------------------------------ |
| location       | GeoJSON | This parameter contains the coordinates of the animal                          |
| timeStamp      | Integer | This parameter contains a UNIX timestamp of when the the location was recorded |

## External Consumer Access

#### Authentication
Authentication will be handled via JSON Web Tokens generated via `Basic-Auth` authentication on `/consumer/authenticate.json`

#### Response
The response & error setups should follow the same pattern as the device endpoints in addition to the individual responses from the endpoints below.

*TL;DR* `success` should always be in the response and `error` should be there if `success` is `false` with the appropriate HTTP code.

### `POST /consumer/authenticate.json`
This endpoint is responsible for authenticating an external consumer so that they can retreive the data from the animal's collar.

#### `GET /collar/<rsc-animal-id>/data.json`
This endpoint will return the one-to-many associations of the animal's individual logs for physical activity, bark incidents and location check-ins.  It should be noted that this should be broken out into individual endpoints should the data packets grow in size.

