document.writeln ('hello welcome to my website');
function findpasscode (inform) {
    var inputnum = inform.textin.value;
    var result;
    if (inputnum >= 1 && inputnum <= 10000000000) {
        result = inputnum*inputnum;
    } else {
        result = "error "
    }
    document.getElementById("display").innerHTML = result;
}