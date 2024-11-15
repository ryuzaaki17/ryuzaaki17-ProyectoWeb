$(document).ready(function(){
    if (window.sessionStorage){
        if(sessionStorage.getItem("loged")==="true" && sessionStorage.getItem("main")==="false"){
            $(".contenedor-general").load("/home.html", function(){
                $("p.name-user").text(sessionStorage.getItem("name"));
            });
        }else if(sessionStorage.getItem("loged")==="true" && sessionStorage.getItem("main")==="true"){
            $(".contenedor-general").load("/prediccion.html",function(){
                $("p.name-user").text(sessionStorage.getItem("name"));
                $("#datos-predichos").hide();
                alternarColorTab("d-c");
                datosOriginales();
                if (sessionStorage.getItem("main-p")==="true"){
                    datosPredichos();
                }
            });
        }else{
            $(".contenedor-general").load("/login.html");
        }
    }

    var active = false;
    $(document).on('click','.user-icon', function(){
        if (active){
            $("#user-data").hide();
            active=false;
        }else{
            $("#user-data").show();
            active=true;
        }
    });

    var actual ="d-c";
    $(document).on('click','.tab-click', function(){
        click=$(this).attr("id");
        if (click!=actual){
            if (actual=="d-c"){
                $("#datos-cargados").hide();
                $("#datos-predichos").show();
                actual = "d-p";
                alternarColorTab(actual);
            }else if (actual=="d-p"){
                $("#datos-predichos").hide();
                $("#datos-cargados").show();
                actual="d-c";
                alternarColorTab(actual);
            }
        }
    });

    function alternarColorTab(main){
        if (main=="d-c"){
            $("#d-c").css("background-color","blue");
            $("#d-c").css("color","white");

            $("#d-p").css("background-color","white");
            $("#d-p").css("color","gray");
        }

        if (main=="d-p"){
            $("#d-p").css("background-color","blue");
            $("#d-p").css("color","white");

            $("#d-c").css("background-color","white");
            $("#d-c").css("color","gray");
        }
    }

    $(document).on('click','#new-predictor', function(){
        $(".contenedor-general").empty();
        $(".contenedor-general").load("/home.html",function(){
            $(".name-user").text(sessionStorage.getItem("name"));
            sessionStorage.setItem("main",false);
            sessionStorage.setItem("main-p",false);
            localStorage.clear();
        });
    });

    function datosOriginales(){
        data=JSON.parse(localStorage.getItem("original-data-data"));

        $(".tabla-original").append("<table class='data-original'><tr class='data-original-cabecera'><th>TX_AVG</th><th>RX_AVG</th><th>ANCHO</th></tr></table>");

        for (i=0;i<data.ancho.length;i++){
            $(".data-original").append("<tr class='table-color'><td>"+data.tx_avg[i]+"</td><td>"+data.rx_avg[i]+"</td><td>"+data.ancho[i]+"</td></tr>");
        }

        $(".imagenes-original").append("<img class='imagenes-pred imagenes-click' src=data:image/png;base64,"+localStorage.getItem("original-data-curva-original")+">");
        $(".imagenes-original").append("<img class='imagenes-pred imagenes-click' src=data:image/png;base64,"+localStorage.getItem("original-data-histograma-original")+">");
    }

    function datosPredichos(){
        data=JSON.parse(localStorage.getItem("predict-data-data"));

        $(".tabla-predichos").append("<table class='data-predict'><tr class='data-predichos-cabecera'><th>Original</th><th>Prediccion</th><th>Diferencia</th></tr></table>");

        for (i=0;i<data.diferencia.length;i++){
            recorte=data.prediccion[i].substring(0,7);
            $(".data-predict").append("<tr class='table-color'><td>"+data.original[i]+"</td><td>"+recorte+"</td><td>"+data.diferencia[i]+"</td></tr>");
        }
        $("#predictor").attr("disabled",true);
        $("#predictor").css("opacity","0.5");

        $(".imagenes-predichos").append("<img class='imagenes-pred imagenes-click' src=data:image/png;base64,"+localStorage.getItem("predict-data-curva-prediccion")+">");
        $(".imagenes-predichos").append("<img class='imagenes-pred imagenes-click' src=data:image/png;base64,"+localStorage.getItem("predict-data-curva-comparacion")+">");
    }

    function AbrirPopUp(titulo,contenido,boton,width){
        $('#popup').fadeIn('slow');
        $('.popup-overlay').fadeIn('slow');
        $('.popup-overlay').height($(document).height());
        $('#titulo-popup').text(titulo);
        $('#contenido-popup').text(contenido);
        $(".content-popup").css("width",width+"%");
        if (boton){
            $('#close').css("display","block");
        }else{
            $('#close').css("display","none");
        }
    }

    function CerrarPopUp(){
        $('#popup').fadeOut('slow');
        $('.popup-overlay').fadeOut('slow');
        return false;
    }

    function GoToByScroll() {
        $('html,body').animate({
            scrollTop: $("#popup").offset().top
        }, 'slow');
    }
 
    $(document).on('click','#close', function(){
        $('#popup').fadeOut('slow');
        $('.popup-overlay').fadeOut('slow');
        return false;
    });

    $(document).on('click','.imagenes-click', function(){
        img=$(this).attr("src");

        $("#pop-up-cont").empty();
        $("#pop-up-cont").append("<img src='"+img+"'>");
        AbrirPopUp("Grafica","",true,75);
        GoToByScroll();
    });

    $(document).on("click","#log-out",function(){
        sessionStorage.clear();
        $(".contenedor-general").empty();
        $(".contenedor-general").load("/login.html");
    });

    $(document).on("click","#predictor",function(){
        $("#pop-up-cont").empty();
        AbrirPopUp("Prediciendo...","Puede tomar unos minutos.",false,30);
        $.ajax({
            type:"POST",
            url:"http://127.0.0.1:5005/prediccion",
            success:function(r){
                localStorage.setItem("predict-data-data",r.datosComparacion);
                localStorage.setItem("predict-data-curva-prediccion",r.curvaPrediccion);
                localStorage.setItem("predict-data-curva-comparacion",r.curvaComparacion);

                data=JSON.parse(r.datosComparacion);

                $(".tabla-predichos").append("<table class='data-predict'><tr class='data-predichos-cabecera'><th>Original</th><th>Prediccion</th><th>Diferencia</th></tr></table>");

                for (i=0;i<data.diferencia.length;i++){
                    recorte=data.prediccion[i].substring(0,7);
                    $(".data-predict").append("<tr class='table-color'><td>"+data.original[i]+"</td><td>"+recorte+"</td><td>"+data.diferencia[i]+"</td></tr>");
                }
                $("#predictor").attr("disabled",true);
                $("#predictor").css("opacity","0.5");

                curvaPrediccion=r.curvaPrediccion;
                $(".imagenes-predichos").append("<img class='imagenes-pred imagenes-click' src=data:image/png;base64,"+curvaPrediccion+">");

                curvaComparacion=r.curvaComparacion;
                $(".imagenes-predichos").append("<img class='imagenes-pred imagenes-click' src=data:image/png;base64,"+curvaComparacion+">");

                sessionStorage.setItem("main-p",true);
                CerrarPopUp();
            },
            error:function(r){
                CerrarPopUp();
            }
        })
    });

    $(document).on("change","input[type='file']",function(e){
        var fileName = e.target.files[0].name;
        $("#selector-file").text(fileName);
    });

    $(document).on("click","#load-data",function(){
        $("#pop-up-cont").empty();
        AbrirPopUp("Cargando","Este proceso puede tardar minutos, por favor espere.",false,30);

        let data= new FormData($("#form")[0]);

        $.ajax({
            type:"POST",
            url:"http://127.0.0.1:5005/uploadfile",
            data:data,
            cache:false,
            contentType:false,
            processData:false,
            success:function(r){
                localStorage.setItem("original-data-data",r.message);
                localStorage.setItem("original-data-curva-original",r.curvaOriginal);
                localStorage.setItem("original-data-histograma-original",r.histogramaOriginal);

                data=JSON.parse(r.message);
                $(".contenedor-general").load("/prediccion.html",function(){
                    $(".tabla-original").append("<table class='data-original'><tr class='data-original-cabecera'><th>TX_AVG</th><th>RX_AVG</th><th>ANCHO</th></tr></table>");

                    for (i=0;i<data.ancho.length;i++){
                        $(".data-original").append("<tr><td>"+data.tx_avg[i]+"</td><td>"+data.rx_avg[i]+"</td><td>"+data.ancho[i]+"</td></tr>");
                    }

                    curvaOriginal=r.curvaOriginal;
                    $(".imagenes-original").append("<img class='imagenes-pred imagenes-click' src=data:image/png;base64,"+curvaOriginal+">");
                    histogramaOriginal=r.histogramaOriginal;
                    $(".imagenes-original").append("<img class='imagenes-pred imagenes-click' src=data:image/png;base64,"+histogramaOriginal+">");

                    $("#datos-predichos").hide();
                    alternarColorTab("d-c");
                    $("p.name-user").text(sessionStorage.getItem("name"));
                });
                sessionStorage.setItem("main",true);
                CerrarPopUp();
            },
            error:function(r){
                data=JSON.parse(r.responseText);
                $("#pop-up-cont").empty();
                AbrirPopUp("Error",data.message,true,30);
            }
        })
    });

    $(document).on("click","#iniciar-sesion",function(){
        username=$("#usuario").val();
        password=$("#contraseña").val();
        $.ajax({
            type:"POST",
            data:JSON.stringify({"username":username,"password":password}),
            url:"http://127.0.0.1:5005/login",
            success: function(r){
                    if (window.sessionStorage){
                            sessionStorage.setItem("name",r.name);
                            sessionStorage.setItem("user",r.user);
                            sessionStorage.setItem("id",r.id);
                            sessionStorage.setItem("loged",true);
                            sessionStorage.setItem("main",false);

                            $(".contenedor-general").empty();
                            $(".contenedor-general").load("/home.html",function(){
                                $(".name-user").text(sessionStorage.getItem("name"));
                            });
                    }else{
                        alert("Aplicativo no funciona con este navegador, intenda acceder desde otro");
                    }
            },
            error:function(r){
                $("#pop-up-cont").empty();
                AbrirPopUp("Error al iniciar sesión","Datos incorrectos",true,30);
            }
        })
    });

    $(document).on("click","#recuperar-contra",function(){
        $(".contenedor-general").empty();
        $(".contenedor-general").load("/recuperar.html",function(){});
    });

    $(document).on("click","#camb-contra",function(){
        $("#camb-contra").attr("disabled",true);
        username = parseInt($("#rec-usuario").val());
        $.ajax({
            type:"POST",
            data:JSON.stringify({"user":username}),
            url:"http://127.0.0.1:5005/changepass",
            success: function(r){
                $(".contenedor-general").empty();
                $(".contenedor-general").load("/setcode.html",function(){});
            },
            error:function(r){
                $("#pop-up-cont").empty();
                AbrirPopUp("Error al cambiar contraseña","",true,30);
                $("#camb-contra").attr("disabled",false);
            }
        })
    });

    $(document).on("click","#env-code",function(){
        $("#env-code").attr("disabled",true);
        code = $("#code-rec").val();
        $.ajax({
            type:"POST",
            data:JSON.stringify({"code":code}),
            url:"http://127.0.0.1:5005/veryfycode",
            success: function(r){
                $(".contenedor-general").empty();
                $(".contenedor-general").load("/updatepass.html",function(){});
            },
            error:function(r){
                $("#pop-up-cont").empty();
                AbrirPopUp("Error al verificar el codigo","",true,30);
                $("#env-code").attr("disabled",false);
            }
        })
    });

    $(document).on("click","#up-contra",function(){
        $("#up-contra").attr("disabled",true);
        pass = $("#new-pass").val();
        passcon = $("#con-new-pass").val();
        if (pass===passcon){
            $.ajax({
                type:"POST",
                data:JSON.stringify({"newpassword":pass,"user":1}),
                url:"http://127.0.0.1:5005/updatepass",
                success: function(r){
                    AbrirPopUp("Contraseña cambiada!","",true,30);
                    $(".contenedor-general").empty();
                    $(".contenedor-general").load("/login.html",function(){});
                },
                error:function(r){
                    $("#pop-up-cont").empty();
                    AbrirPopUp("Error al cambiar contraseña","",true,30);
                    $("#up-contra").attr("disabled",false);
                }
            })
        }
    });
});