/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
  // Application Constructor
  initialize: function () {
    this.bindEvents();
  },
  // Bind Event Listeners
  //
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function () {
    document.addEventListener("deviceready", this.onDeviceReady, false);
  },
  // deviceready Event Handler
  //
  // The scope of 'this' is the event. In order to call the 'receivedEvent'
  // function, we must explicitly call 'app.receivedEvent(...);'
  onDeviceReady: function () {
    app.receivedEvent("deviceready");
    app.onPlay();
    app.onGetDeviceList();
  },
  // Update DOM on a Received Event
  receivedEvent: function (id) {
    document.getElementById("toggleCamera").addEventListener(
      "click",
      function () {
        this.onGetCurrentDevice(false);

        var self = this;
        setTimeout(function() {
          self.onToggleCamera();
        }, 1000);  
      }.bind(this),
      false
    );
    document.getElementById("getCurrentDevice").addEventListener(
      "click",
      function () {
        this.onGetCurrentDevice(true);
      }.bind(this),
      false
    );
    document.getElementById("play").addEventListener(
      "click",
      function () {
        this.onPlay();
      }.bind(this),
      false
    );
    document.getElementById("flip").addEventListener(
      "click",
      function () {
        this.onFlip();
      }.bind(this),
      false
    );
    document.getElementById("stop").addEventListener(
      "click",
      function () {
        this.onStop();
      }.bind(this),
      false
    );
    document.getElementById("switch").addEventListener(
      "click",
      function () {
        this.onSwitch();
      }.bind(this),
      false
    );
    document.getElementById("torch").addEventListener(
      "click",
      function () {
        this.onTorch();
      }.bind(this),
      false
    );

    if (window.plugin.CanvasCamera) {
      window.plugin.CanvasCamera.initialize({
        fullsize: window.document.getElementById("fullsize"),
        thumbnail: window.document.getElementById("thumbnail"),
      });
    }
  },
  onToggleCamera: function () {
    if (window.plugin.CanvasCamera) {
      var self = this;
      // Find next camera
      if (self.deviceList.length > 1) {
        var devIndex = 0;
        var nextDevIndex = 0;
        for (var device of self.deviceList) {
          if (device.DeviceId == self.currentDevice.DeviceId) {
            if (devIndex < (self.deviceList.length - 1)) {
              nextDevIndex = devIndex + 1;
              break;
            }
          }
          devIndex++;
        }

        var nextDeviceId = self.deviceList[nextDevIndex].DeviceId;

        window.plugin.CanvasCamera.switchCamera(
          nextDeviceId,
          function (error) {
            console.log("[CanvasCamera switchCamera]", "error", error);
          },
          function (data) {
            console.log("[CanvasCamera switchCamera]", "data", data);
          }
        );
      }
    }
  },
  currentDevice: {},
  onGetCurrentDevice: function (isShowPopup) {
    console.log("getCurrentDevice");
    if (window.plugin.CanvasCamera) {
      var self = this;
      window.plugin.CanvasCamera.getCurrentDevice(
        function (error) {
          console.log("[CanvasCamera getCurrentDevice]", "error", error);
        },
        function (data) {
          console.log("[CanvasCamera getCurrentDevice]", "data", JSON.stringify(data));
          self.currentDevice = data;
          if (isShowPopup) {
            alert(JSON.stringify(data));
          }
        }
      );
    }
  },
  deviceList: [],
  onGetDeviceList: function () {
    if (window.plugin.CanvasCamera) {
      var self = this;
      window.plugin.CanvasCamera.getDeviceList(
        function (error) {
          console.log("[CanvasCamera getDeviceList]", "error", error);
        },
        function (data) {
          console.log("[CanvasCamera getDeviceList]", "data", JSON.stringify(data));
          self.deviceList = data;
          alert(JSON.stringify(self.deviceList));
        }
      );
    }
  },
  onPlay: function () {
    console.log("play");
    if (window.plugin.CanvasCamera) {
      var options = {
        canvas: {
          width: 320,
          height: 240,
        },
        capture: {
          width: 640,
          height: 480,
        },
        deviceId: 2003,
        use: "data",
        fps: 30,
        flashMode: this.flash,
        hasThumbnail: true,
        thumbnailRatio: 1 / 6,
        cameraFacing: this.position,
      };
      window.plugin.CanvasCamera.start(
        options,
        function (error) {
          console.log("[CanvasCamera start]", "error", error);
        },
        function (data) {
          console.log("[CanvasCamera start]", "data", data);
        }
      );
    }
  },
  flip: {},
  onFlip: function () {
    console.log("flip");
    if (window.plugin.CanvasCamera) {
      var self = this;
      if (self.flip.flipped) {
        self.flip.scaleH = 1;
        self.flip.scaleV = 1;
        self.flip.flipped = false;
      } else {
        self.flip.scaleH = -1;
        self.flip.scaleV = -1;
        self.flip.flipped = true;
      }
      console.log(self.flip);
      if (!self.flip.listener) {
        self.flip.listener = true;
        window.plugin.CanvasCamera.beforeFrameRendering(function (
          event,
          frame
        ) {
          this.context.save();
          frame.dWidth = frame.dWidth * self.flip.scaleH;
          frame.dHeight = frame.dHeight * self.flip.scaleV;
          this.context.scale(self.flip.scaleH, self.flip.scaleV);
          console.log(self.flip.scaleH, self.flip.scaleV);
        });
        window.plugin.CanvasCamera.afterFrameRendering(function (event, frame) {
          this.context.restore();
        });
      }
    }
  },
  flash: false,
  onTorch: function () {
    console.log("torch");
    if (window.plugin.CanvasCamera) {
      this.flash = this.flash ? false : true;
      window.plugin.CanvasCamera.flashMode(
        this.flash,
        function (error) {
          console.log("[CanvasCamera flashMode]", "error", error);
        },
        function (data) {
          console.log("[CanvasCamera flashMode]", "data", data);
        }
      );
    }
  },
  position: "usb",
  onSwitch: function () {
    console.log("switch");
    if (window.plugin.CanvasCamera) {
      this.position = this.position === "front" ? "back" : "front";
      window.plugin.CanvasCamera.cameraPosition(
        this.position,
        function (error) {
          console.log("[CanvasCamera cameraPosition]", error);
        },
        function (data) {
          console.log("[CanvasCamera cameraPosition]", "data", data);
        }
      );
    }
  },
  onStop: function () {
    console.log("stop");
    if (window.plugin.CanvasCamera) {
      window.plugin.CanvasCamera.stop(
        function (error) {
          console.log("[CanvasCamera stop]", "error", error);
        },
        function (data) {
          console.log("[CanvasCamera stop]", "data", data);
        }
      );
    }
  },
};

app.initialize();
