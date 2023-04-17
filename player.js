let select_piece = null
let last_movement = {
    "movement_name" : null,
    "come_from": null
}
let turn = 0
let check = 0
let prohibed_moves = []
let permited_moves = []
let clavadas = {}

mode = "online" // online // local // IA
online_player = "white"
async function just_moved(movement){// FUNCION PARA TRANSMITIR LA MOVIDA AL JUEGO CONLINE
    if(mode == "online"){
        console.log(movement)
    }
}

let enroque = {
    0:{
        "short":true,
        "large":true
    },

    1:{
        "short":true,
        "large":true
    }
}

function coronacion(){
    piece_to_change = "cancel"

    return(
        Swal.fire({
            //title: 'Promotion',
            html:
                `
                    <span>
                        <button class="promotion_icon" onclick="piece_to_change = 'rock';Swal.close()"><img src="sprites/white/rock.png" alt=""></button>
                        <button class="promotion_icon" onclick="piece_to_change = 'horse';Swal.close()"><img src="sprites/white/horse.png" alt=""></button>
                        <button class="promotion_icon" onclick="piece_to_change = 'bishop';Swal.close()"><img src="sprites/white/bishop.png" alt=""></button>
                        <button class="promotion_icon" onclick="piece_to_change = 'queen';Swal.close()"><img src="sprites/white/queen.png" alt=""></button>
                    </span>
                `,
            showConfirmButton: false
          }).then(function(resolve){
            return(piece_to_change)
          })
    )      
}

function check_mate(color){
    Swal.fire({
        title: 'Check Mate!',
        text: color + ' wins',
        imageUrl: 'sprites/' + color + '_king.png',
        imageWidth: 180,
        imageHeight: 180,
        imageAlt: 'King',
      })
}

function clear_legal_movements(){
    $(".legal_move").removeClass("cm")
    $(".legal_move").removeClass("lmw")
    $(".legal_move").removeClass("lmb")
    $(".legal_move").removeClass("enroque")
    $(".legal_move").removeClass("legal_move")
}

function set_as_legal_movement(checker,forced_capture = false,isking=false,piece_to_move){
    if(clavadas[piece_to_move.parentElement.id]){
        if(clavadas[piece_to_move.parentElement.id].indexOf(checker) == -1){return}}
    if(check == 1 && permited_moves.indexOf(checker) >= 0 || check == 0 || isking){

        if(checker.children.length > 0){$(checker).addClass("cm legal_move")}
        else if(forced_capture){$(checker).addClass("cm legal_move")}
        else{
            if($(checker).hasClass("wc")){$(checker).addClass("lmw legal_move")}
            else{$(checker).addClass("lmb legal_move")}
        }

    }
}

function get_next_checker(actual_checker,checker_to_get){
    checker_row = actual_checker.parentElement
    checker_column = actual_checker.parentElement.parentElement
    checker_row_index = $(actual_checker).index()
    checker_column_index = $(actual_checker.parentElement).index()

    // ------ PUNTOS PRINCIPALES (90°) ------ //
    if(checker_to_get == "n"){
        if(checker_column_index != 0){
            return checker_column.children[checker_column_index - 1].children[checker_row_index]}
        return null}

    if(checker_to_get == "s"){
        if(checker_column_index != 7){
            return checker_column.children[checker_column_index + 1].children[checker_row_index]}
        return null}

    if(checker_to_get == "e"){
        if(checker_row_index != 7){
            return checker_row.children[checker_row_index + 1]}
        return null}

    if(checker_to_get == "o"){
        if(checker_row_index != 0){
            return checker_row.children[checker_row_index - 1]}
        return null}


    // ------ PUNTOS DIAGONALES (45°) ------ //
    if(checker_to_get == "ne"){
        if(checker_column_index != 0 && checker_row_index != 7){
            return checker_column.children[checker_column_index - 1].children[checker_row_index + 1]}
        return null
    }
    if(checker_to_get == "no"){
        if(checker_column_index != 0 && checker_row_index != 0){
            return checker_column.children[checker_column_index - 1].children[checker_row_index - 1]}
        return null
    }

    if(checker_to_get == "se"){
        if(checker_column_index != 7 && checker_row_index != 7){
            return checker_column.children[checker_column_index + 1].children[checker_row_index + 1]}
        return null}

    if(checker_to_get == "so"){
        if(checker_column_index != 7 && checker_row_index != 0){
            return checker_column.children[checker_column_index + 1].children[checker_row_index - 1]}
        return null}
}

function get_piece_type(piece){
    if($(piece).hasClass("P")){return "P"}
    if($(piece).hasClass("R")){return "R"}
    if($(piece).hasClass("N")){return "N"}
    if($(piece).hasClass("B")){return "B"}
    if($(piece).hasClass("K")){return "K"}
    if($(piece).hasClass("Q")){return "Q"}
    return null
}

function get_t_movement(directions,piece,enemy,only_info = false){
    let contrast
    let chekers = []

    for(dir of directions){
        if(dir == "n" || dir == "s"){contrast = ["e","o"]}
        if(dir == "e" || dir == "o"){contrast = ["n","s"]}
    
        if(get_next_checker(piece,dir) != null){
            let next_check = get_next_checker(piece,dir)
            if(get_next_checker(next_check,dir) != null){
                next_check = get_next_checker(next_check,dir)
                for(wing of contrast){
                    if(get_next_checker(next_check,wing) != null){
                        if(!only_info){
                            if(get_next_checker(next_check,wing).children.length > 0){
                                if($(get_next_checker(next_check,wing).children[0]).hasClass(enemy)){
                                    set_as_legal_movement(get_next_checker(next_check,wing),false,false,piece.children[0])}}
                            else{
                                set_as_legal_movement(get_next_checker(next_check,wing),false,false,piece.children[0])}
                        }
                        else{
                            chekers.push(get_next_checker(next_check,wing))
                        }
                    }
                }
            }
        }
    }
    if(only_info){return chekers}
}

function get_movements(piece){
    clear_legal_movements()
    if(check > 1 && !$(piece).hasClass("K")){return}
    let enemy
        if($(piece).hasClass("white")){enemy = "black"}
        if($(piece).hasClass("black")){enemy = "white"}
    function set_row(direction){

        let actual_checker = piece.parentElement
        while(true){
            if(get_next_checker(actual_checker,direction) != null){
                if(get_next_checker(actual_checker,direction).children.length == 0){
                    actual_checker = get_next_checker(actual_checker,direction)
                    set_as_legal_movement(actual_checker,false,false,piece)
                }
                else if($(get_next_checker(actual_checker,direction).children[0]).hasClass(enemy)){
                    set_as_legal_movement(get_next_checker(actual_checker,direction),false,false,piece)
                    break
                }
                else{break}
            }
            else{break}
        }}

    function set_orto_rows(){
        set_row("n")// movimiento norte
        set_row("s")// movimiento sur
        set_row("e")// movimiento norte
        set_row("o")// movimiento sur
    }

    function set_diagonal_rows(){
        set_row("ne")// movimiento noreste
        set_row("no")// movimiento noroeste
        set_row("se")// movimiento sureste
        set_row("so")// movimiento suroeste
    }

    if($(piece).hasClass("P")){ // ------ MOVIMIENTO DEL PEON ------ //

        function pawn_movements(orientation,enemy){
            let nxt_chk = get_next_checker(piece.parentElement,orientation)
            let base_line
            let capture_line
            let original_pos_line
            if(enemy == "black"){
                original_pos_line = 7
                capture_line = 3
                base_line = 6}
            else if(enemy == "white"){
                original_pos_line = 2
                base_line = 1
                capture_line = 4}
            if(nxt_chk != null){
                if(nxt_chk.children.length == 0){
                    set_as_legal_movement(nxt_chk,false,false,piece) // avance normal
                    if($(piece.parentElement.parentElement).index() == base_line){ // avance doble
                        if(get_next_checker(nxt_chk,orientation).children.length == 0){
                            set_as_legal_movement(get_next_checker(nxt_chk,orientation),false,false,piece)}}
                }
            }
            
            // ---- capturas normales ---- //
            let right_capture = get_next_checker(piece.parentElement,orientation + "e") // captura derecha
            if(right_capture != null){
                if(right_capture.children.length > 0){
                    if($(right_capture.children[0]).hasClass(enemy)){
                        set_as_legal_movement(right_capture,false,false,piece)
                    }
                }
            }


            let left_capture = get_next_checker(piece.parentElement,orientation + "o") // captura izquierda
            if(left_capture != null){
                if(left_capture.children.length > 0){
                    if($(left_capture.children[0]).hasClass(enemy)){
                        set_as_legal_movement(left_capture,false,false,piece)
                    }
                }
            }

            // ---- capturas al paso ---- //
            if($(piece.parentElement.parentElement).index() == capture_line){
                let right_check = get_next_checker(piece.parentElement,"e")
                let left_check = get_next_checker(piece.parentElement,"o")
                if(right_check != null){
                    if(last_movement["movement_name"] == "P" + right_check.id){// captura derecha
                        if((right_check.id[0] + original_pos_line) == last_movement["come_from"].id){
                            set_as_legal_movement(get_next_checker(piece.parentElement,orientation + "e"),true,false,piece)
                        }}
                }
                if(left_check != null){
                    if(last_movement["movement_name"] == "P" + left_check.id){// captura izquierda
                        if((left_check.id[0] + original_pos_line) == last_movement["come_from"].id){
                            set_as_legal_movement(get_next_checker(piece.parentElement,orientation + "o"),true,false,piece)
                        }}
                }
            }


        }
        //-/ _______________________________ PEON BLANCO _____________________________ /-//
        if($(piece).hasClass("white")){pawn_movements("n","black")}
        //-/ ________________________________ PEON NEGRO _____________________________ /-//
        if($(piece).hasClass("black")){pawn_movements("s","white")}

    
    }
    if($(piece).hasClass("R")){ // ----- MOVIMIENTO DE LA TORRE ---- //
        set_orto_rows()
    }
    if($(piece).hasClass("N")){ // ----- MOVIMIENTO DEL CABALLO ---- /
        get_t_movement(["n","s","e","o"],piece.parentElement,enemy)
    }

    if($(piece).hasClass("B")){// ----- MOVIMIENTO DEL ALFIL ---- //
        set_diagonal_rows()
    }
    if($(piece).hasClass("K")){// ----- MOVIMIENTO DEL REY ----- // ***incompleto***
        let cardinal_points = ["n","s","e","o","ne","no","se","so"]
        for(point of cardinal_points){
            if(get_next_checker(piece.parentElement,point) != null){
                if(get_next_checker(piece.parentElement,point).children.length > 0){
                    if($(get_next_checker(piece.parentElement,point).children[0]).hasClass(enemy)){
                        nxt_chk = get_next_checker(piece.parentElement,point)
                        if(!prohibed_moves.includes(nxt_chk.id)){
                            set_as_legal_movement(get_next_checker(piece.parentElement,point),false,true,piece)
                        }
                    }}
                else{
                    nxt_chk = get_next_checker(piece.parentElement,point)
                    if(!prohibed_moves.includes(nxt_chk.id)){
                        set_as_legal_movement(get_next_checker(piece.parentElement,point),false,true,piece)
                    }
                }
            }
        }

        //----------- ENROQUES ------------//
        function is_enroque_under_attack(checker){
            let enemy = "white"
            let main_direction = "s"
            if($(piece).hasClass("white")){enemy = "black" ; main_direction = "n"}

            //--> busqueda en L
            let casillas_L = get_t_movement(["n","s","e","o"],checker,enemy,true)
            for(casilla of casillas_L){
                if(casilla.children.length > 0){
                    if(
                        casilla.children[0].classList.contains(enemy) && 
                        casilla.children[0].classList.contains("N")
                        ){return true}
                }
            }

            let nxt_chk//--> busqueda por lineas
            for(searching_line of [[main_direction,"R"],[main_direction+"e","B"],[main_direction+"o","B"]]){
                nxt_chk = get_next_checker(checker,searching_line[0])
                while(true){
                    if(nxt_chk != null){
                        if(nxt_chk.children.length == 0){nxt_chk = get_next_checker(nxt_chk,searching_line[0])}
                        else {
                            piece_classList = nxt_chk.children[0].classList
                            if(
                                piece_classList.contains(enemy) && 
                                (piece_classList.contains(searching_line[1]) || piece_classList.contains("Q"))
                            ){
                                return true}
                            break
                        }}    
                    else break 
                }}
            return false

        }

        if(enroque[turn]["short"]){//--> corto
            if(get_next_checker(piece.parentElement,"e").children.length == 0){
                side_to_king = get_next_checker(piece.parentElement,"e")
                if(!is_enroque_under_attack(side_to_king)){
                    if(get_next_checker(side_to_king,"e").children.length == 0){
                        if(!is_enroque_under_attack(get_next_checker(side_to_king,"e"))){
                            if(check == 0){
                                $(get_next_checker(side_to_king,"e")).addClass("legal_move")
                                $(get_next_checker(side_to_king,"e")).addClass("enroque")}}   
                    }}   
            }
        }

        if(enroque[turn]["large"]){//--> largo
            if(get_next_checker(piece.parentElement,"o").children.length == 0){
                side_to_king = get_next_checker(piece.parentElement,"o")
                if(!is_enroque_under_attack(side_to_king)){
                    if(get_next_checker(side_to_king,"o").children.length == 0){
                        side_to_king = get_next_checker(side_to_king,"o")
                        if(!is_enroque_under_attack(side_to_king)){
                            if(get_next_checker(side_to_king,"o").children.length == 0){
                                if(!is_enroque_under_attack(get_next_checker(side_to_king,"o"))){
                                    if(check == 0){
                                        $(side_to_king).addClass("legal_move")
                                        $(side_to_king).addClass("enroque")}
                                }   
                            }
                        }
                    }   
                }
            }
        }

    }

    if($(piece).hasClass("Q")){// ------ MOVIMIENTO DE LA DAMA ------ //
        set_orto_rows()
        set_diagonal_rows()
    }
}

function check_check(){// checkea si alguno de los reyes está en jaque, y/o reduce
                       // los movimientos posibles
    var king = $(".K.white")
    var player = "white"
    var enemy = "black"
    if(turn){
        king = $(".K.black")
        enemy = "white"
        player = "black"
    }



    prohibed_moves = []
    function search_line(piece,cardinal_points,piece_to_search,enemy,add_to_legal = false){
        let piece_backup = piece
        let player = "white"
        let clavada_flag = null
        if(enemy == "white"){player = "black"}

        for(point of cardinal_points){
            let recorrido = []
            let post_recorrido = []
            piece = piece_backup
            while(true){
                if(get_next_checker(piece,point) != null){
                    if(get_next_checker(piece,point).children.length == 0){
                        piece = get_next_checker(piece,point)
                        if(clavada_flag == null){recorrido.push(piece)}
                        else{post_recorrido.push(piece)}// ya se topó con pieza amiga
                        
                        
                    }
                    else{
                        let temporal_nxt_chk = $(get_next_checker(piece,point).children[0])
                        if(temporal_nxt_chk.hasClass(player) && temporal_nxt_chk.hasClass("K")){
                            piece = get_next_checker(piece,point)
                            //recorrido.push(piece)
                        }
                        else if($(get_next_checker(piece,point).children[0]).hasClass(enemy)){
                            if(
                                $(get_next_checker(piece,point).children[0]).hasClass(piece_to_search) ||
                                $(get_next_checker(piece,point).children[0]).hasClass("Q")){
                                    if(clavada_flag == null){
                                        recorrido.push(get_next_checker(piece,point))
                                        if(add_to_legal){
                                            permited_moves = permited_moves.concat(recorrido)
                                        }
                                        return true
                                    }
                                    else{// ya se topó con pieza amiga
                                        post_recorrido.push(get_next_checker(piece,point))
                                        clavadas[clavada_flag[0].parentElement.id] = recorrido.concat(post_recorrido)
                                        break
                                        
                                    }
                                    
                                }
                            else{break}}
                        else{
                            if(!add_to_legal){break}// en este punto encuentra una pieza de mi mismo color
                            if(clavada_flag != null){break}
                            piece = get_next_checker(piece,point)
                            clavada_flag = $(piece.children[0])
                        }
                    }}
                else{break}
            }
        }
        return false
    }

    function pawn_check(piece,enemy,using_king = false){
        let main_direction
        

        if(enemy == "black"){main_direction="n"}
        if(enemy == "white"){main_direction="s"}
        
        for(direction of ["e","o"]){
            if(get_next_checker(piece,main_direction+direction) != null){
                if(get_next_checker(piece,main_direction+direction).children.length > 0){
                    if(
                        $(get_next_checker(piece,main_direction+direction).children[0]).hasClass(enemy) &&
                        $(get_next_checker(piece,main_direction+direction).children[0]).hasClass("P")){
                            if(using_king){
                                permited_moves.push(get_next_checker(piece,main_direction+direction))
                                check++}
                            return true
                        }
                }
            }
        }
        return false
    }

    function search_for_kings(piece,enemy){
        for(point of ["n","s","e","o","ne","no","se","so"]){
            nxt_chk = get_next_checker(piece,point)
            if(nxt_chk != null){
                if(nxt_chk.children.length > 0){
                    if($(nxt_chk.children[0]).hasClass(enemy) && $(nxt_chk.children[0]).hasClass("K")){
                        return true
                    }}}}
        return false
    }

    function search_for_knights(check,enemy_,function_to_do){
        for(movement of get_t_movement(["n","s","e","o"],check,null,true)){
            if(movement.children.length > 0){
                if($(movement.children[0]).hasClass(enemy_) && $(movement.children[0]).hasClass("N")){
                    function_to_do(movement)}}}
    }

    // -------------------- DESCARTANDO MOVIMIENTOS ILEGALES *REY* ---------------------- //
    var no_option_count = 0
    var check_block = false
    for(direction of ["n","s","e","o","ne","se","so","no"]){
        var next_check = get_next_checker(king[0].parentElement,direction)
        var noc_already_updated = false

        
        if(next_check != null){

            if(next_check.children.length > 0){
                if(next_check.children[0].classList.contains(king[0].classList[0])){
                    no_option_count++
                    noc_already_updated = true
                }
            }

            if(search_line(next_check,["n","s","o","e"],"R",enemy)){//busca amenazas de torre
                prohibed_moves.push(next_check.id)
                if(!noc_already_updated) no_option_count++}
            else if(search_line(next_check,["ne","no","se","so"],"B",enemy)){//busca amenazas de alfil
                prohibed_moves.push(next_check.id)
                if(!noc_already_updated) no_option_count++}
            else if(search_for_kings(next_check,enemy)){//busca amenazas por rey
                prohibed_moves.push(next_check.id)
                if(!noc_already_updated) no_option_count++}
            else if(pawn_check(next_check,enemy)){//busca amenazas por peon
                prohibed_moves.push(next_check.id)
                if(!noc_already_updated) no_option_count++}
            else{ //busca amenazas por caballo
                search_for_knights(next_check,enemy,function(movement){
                    prohibed_moves.push(next_check.id)
                    if(!noc_already_updated) no_option_count++
                })}

        }
        else{no_option_count++}
    }

    // ------------------- DETECTANDO JAQUES Y AÑADIENDO LOS MOVIMIENTOS DE BLOQUEO ----------------- //
    for(or of ["n","s","e","o"]){
        if(search_line(king[0].parentElement,[or],"R",enemy,true)){check++}}
    for(or of ["ne","no","se","so"]){
        if(search_line(king[0].parentElement,[or],"B",enemy,true)){check++}}
    search_for_knights(king[0].parentElement,enemy,function(movement_){
        check++
        permited_moves.push(movement_)
    })
    pawn_check(king[0].parentElement,enemy,true)

    //--------------------- DETECTANDO JAQUE MATE ---------------------//
    for(movement of permited_moves){
        var direction = "s"
        if(turn == 1){direction = "n"}
        if(!(permited_moves.indexOf(movement) == permited_moves.length-1)){
            previous_checker = get_next_checker(movement,direction)
            if(previous_checker != null){
                if(previous_checker.children.length > 0){
                    if(
                        previous_checker.children[0].classList.contains("P") && 
                        previous_checker.children[0].classList.contains(player)){
                            check_block = true
                        }
                }
                pre_checker = get_next_checker(previous_checker,direction)
                if(pre_checker != null){
                    
                    if(pre_checker.children.length > 0){
                        if(pre_checker.id[1] == 2 || pre_checker.id[1] == 7){
                            if(pre_checker.children[0].classList.contains("P") && 
                                pre_checker.children[0].classList.contains(player)){
                                    check_block = true
                                }
                        }
                    }
                }
            }
        }
        else{
            right = get_next_checker(movement,direction + "e")
            left= get_next_checker(movement,direction + "o")
            for(capture of [right,left]){
                if(capture != null){
                    if(capture.children.length > 0){
                        if(
                            capture.children[0].classList.contains("P") && 
                            capture.children[0].classList.contains(player)){
                                check_block = true
                            }
                    }
                }
            }
        }

        if(search_line(movement,["n","s","e","o"],"R",player,false)) check_block = true
        if(search_line(movement,["no","ne","so","se"],"B",player,false)) check_block = true
        search_for_knights(movement,player,function(_){check_block = true})
    }

    if(
        (last_movement["come_from"].id[1] == 7 || 
        last_movement["come_from"].id[1] == 2) &&
        last_movement["movement_name"][0] == "P"){
            var pawn_ = document.getElementById(last_movement["movement_name"].slice(1))
            for(diagonal of [get_next_checker(pawn_,direction + "e"),get_next_checker(pawn_,direction + "o")]){
                if(diagonal != null){
                    if(diagonal.children.length > 0){
                        if(diagonal.children[0].classList.contains("K") && diagonal.children[0].classList.contains(player)){
                            for(lateral of [get_next_checker(pawn_,"e"),get_next_checker(pawn_,"o")]){
                                if(lateral != null){
                                    if(lateral.children.length > 0){
                                        if(
                                            lateral.children[0].classList.contains("P") && 
                                            lateral.children[0].classList.contains(player)){
                                                if(direction == "s")permited_moves.push(get_next_checker(pawn_,"n"))
                                                if(direction == "n")permited_moves.push(get_next_checker(pawn_,"s"))
                                                check_block = true
                                            }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    
    if(no_option_count == 8 && check == 1 && !check_block){
        if(turn == 0)check_mate("Black")
        else check_mate("White")}

}

function select_current_piece(piece,forced = false){ //selecciona una pieza por código, da la opción de hacerlo forzosamente
    if(mode == "online" && !$(piece).hasClass(online_player) && !forced)return
    if(($(piece).hasClass("white") && turn == 0) || ($(piece).hasClass("black") && turn == 1)){

        get_movements(piece)

        if(select_piece != null){
            select_piece.removeClass("selected")
        }
    
        select_piece = $(piece.parentElement)
        select_piece.addClass("selected")
        
    }
}

function assing_functions(){ // -> al hacer click en una pieza selecciona la pieza
    $(".piece").click(function(){
        select_current_piece(this)
    })
}

async function move_piece(pieza_tocada,by_pass_promoting = null){// -> mueve una pieza
    
    if(select_piece != null){
        if($(pieza_tocada).hasClass("legal_move") && (pieza_tocada.children.length == 0 || (!turn && $(pieza_tocada.children[0]).hasClass("black")) || (turn && $(pieza_tocada.children[0]).hasClass("white")))){
            
            //_______________CANCELANDO__ENROQUES______________//
            if(get_piece_type(select_piece[0].children[0]) == "K"){
                enroque[turn]["short"] = false
                enroque[turn]["large"] = false}//--> si es rey cancela ambos enroques

            if(get_piece_type(select_piece[0].children[0]) == "R" && select_piece[0].id[0] == "H"){
                enroque[turn]["short"] = false}//--> la torre de H cancela el enroque corto

            if(get_piece_type(select_piece[0].children[0]) == "R" && select_piece[0].id[0] == "A"){
                enroque[turn]["large"] = false}//--> la torre de A cancela el enroque largo

            
            last_movement["movement_name"] = get_piece_type(//---- guardo el último movimiento --- //
                select_piece[0].children[0]) + pieza_tocada.id
            last_movement["come_from"] = select_piece[0]
            

            // _______________________ CAPTURAS ______________________ //
            if($(pieza_tocada).hasClass("cm")){
                if(pieza_tocada.children.length > 0){
                    $(pieza_tocada).empty()} // si tiene una pieza es una captura normal
                else{// si no es una captura al paso
                    if($(select_piece[0].children[0]).hasClass("white")){
                        $(get_next_checker(pieza_tocada,"s")).empty()}
                    else{$(get_next_checker(pieza_tocada,"n")).empty()}
                }
            }
            
            //________ CORONACION_________//
            if((pieza_tocada.id[1] == 8 || pieza_tocada.id[1] == 1) && 
                select_piece[0].children[0].classList.contains("P")){
                    if(by_pass_promoting != null)response = by_pass_promoting
                    else response = await coronacion()
                    if(response == "cancel") return
                    if(response == "rock"){
                        select_piece.empty()
                        if(!turn)select_piece.html('<img class="white piece R" src="sprites/white/rock.png" alt="">')
                        else select_piece.html('<img class="black piece R" src="sprites/black/rock.png" alt="">')
                    }
                    if(response == "horse"){
                        select_piece.empty()
                        if(!turn)select_piece.html('<img class="white piece N" src="sprites/white/horse.png" alt="">')
                        else select_piece.html('<img class="black piece N" src="sprites/black/horse.png" alt="">')
                    }
                    if(response == "bishop"){
                        select_piece.empty()
                        if(!turn)select_piece.html('<img class="white piece B" src="sprites/white/bishop.png" alt="">')
                        else select_piece.html('<img class="black piece B" src="sprites/black/bishop.png" alt="">')
                    }
                    if(response == "queen"){
                        select_piece.empty()
                        if(!turn)select_piece.html('<img class="white piece Q" src="sprites/white/queen.png" alt="">')
                        else select_piece.html('<img class="black piece Q" src="sprites/black/queen.png" alt="">')
                    }
                }
            
            
            
            
            $(pieza_tocada).append(select_piece.html())// --> traslada el contenido de la casilla seleccionada a la nueva
            if(pieza_tocada.classList.contains("enroque")){//--> movimiento de las torres en los enroques
                if(pieza_tocada.id == "G1"){//-> cortos
                    $("#F1").append($("#H1").html())
                    $("#H1").empty()}
                if(pieza_tocada.id == "G8"){
                    $("#F8").append($("#H8").html())
                    $("#H8").empty()}

                if(pieza_tocada.id == "C1"){//-> largos
                    $("#D1").append($("#A1").html())
                    $("#A1").empty()}
                if(pieza_tocada.id == "C8"){//-> largos
                    $("#D8").append($("#A8").html())
                    $("#A8").empty()}
            }


            select_piece.empty()// --> limpia la casilla seleccionada
            select_piece.removeClass("selected")

            turn = 1 - turn // --> cambia de turno y cambia el texto del turno
            $("#turn").text("turn: white")
            if(turn){$("#turn").text("turn: black")}

            clear_legal_movements() // --> limpia los legal movements y des-setea la variable select_piece
            select_piece = null
            assing_functions()// --> reasigna las funciones en caso del nuevo html insertado
            check = 0
            permited_moves = []
            clavadas = {}
            check_check()
            just_moved(last_movement)
        }
    }
    
}
$("th").click(function(){move_piece(this)})//----> al hacer click en una casilla

assing_functions()// --> asigna las funciones por primera vez

function move_from_code(movement/*[casilla_inicial,casilla_final]*/){//---------- FUNCION QUE MUEVE UNA PIEZA DESDE EL CÓDIGO ----------------//
    try{
        var casilla_inicial = document.getElementById(movement[0])
        var casilla_final = document.getElementById(movement[1])
        var piece_to_change_ = null
    }
    catch{
        console.log("not valid input")
        return
    }

    var actual_turn = "white"
    if(turn)actual_turn = "black"

    if(
        (casilla_final.id[1] == "8" || casilla_final.id[1] == "1") &&
        casilla_inicial.children[0].classList.contains("P"))
        {
            try{
                piece_to_change_ = movement[2]
                if(
                    piece_to_change_ != "rock" &&
                    piece_to_change_ != "horse" &&
                    piece_to_change_ != "bishop" &&
                    piece_to_change_ != "queen"){console.log("DONT VALID MOVEMENT!");return}}
            catch{console.log("DONT VALID MOVEMENT!");return}
        }
    
    if(casilla_inicial != null && casilla_final != null){
        if(casilla_inicial.children.length > 0){
            if(casilla_inicial.children[0].classList.contains(actual_turn)){
                select_current_piece(casilla_inicial.children[0],true)
                
                if(casilla_final.classList.contains("legal_move")){
                    if(piece_to_change_ == null){
                        casilla_final.click()
                        return
                    }
                    move_piece(casilla_final,piece_to_change_)
                    return
                }

            }
        }    
    }
    console.log("DONT VALID MOVEMENT!")
}