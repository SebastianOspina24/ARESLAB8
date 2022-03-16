var app = (function () {

    var urlDibujo = 0;

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    var publicPointAtTopic = function (point){
        stompClient.send(urlDibujo, {}, JSON.stringify(point));
        console.log("Se publico el punto "+point);
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe(urlDibujo, function (eventbody) {
                var point=JSON.parse(eventbody.body);
                addPointToCanvas(point);
            });
        });

    };
    
    

    return {

        connect: function (dibujo) {
            var can = document.getElementById("canvas");
            //websocket connection
            urlDibujo = '/topic/newpoint.'+dibujo;
            connectAndSubscribe();
            alert("Te conectaste al dibujo No"+ dibujo);
            if(window.PointerEvent){
                can.addEventListener("pointerdown",function(evt){
                    var point = getMousePosition(evt);
                    console.log(point);
                    addPointToCanvas(point);
                    publicPointAtTopic(point)
                });
            }
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);
            publicPointAtTopic(pt)
            //publicar el evento
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();