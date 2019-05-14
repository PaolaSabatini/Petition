const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
var signing = false;

$("canvas").on("mousedown", function(e) {
    ctx.beginPath();

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    ctx.moveTo(e.offsetX, e.offsetY);

    signing = true;

    $("canvas").on("mouseup", function() {
        signing = false;
    });

    $("canvas").on("mousemove", function(e) {
        if (signing) {
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        }
    });
});

$(".submit").on("click", function(e) {
    document.getElementById("signature").value = canvas.toDataURL();
});
