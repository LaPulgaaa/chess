'use client'

import { MouseEvent, useRef, useState} from "react";
import Image, { StaticImageData } from "next/image";

import type { Square, PieceSymbol, Color } from "chess.js";
import { SQUARES } from "chess.js";

import { board_orien } from "@repo/store";

import { GameManager } from "@/lib/singleton/game_manager";

// white pieces
import wr from "@/public/wr.png";
import wn from "@/public/wn.png";
import wb from "@/public/wb.png";
import wq from "@/public/wq.png";
import wk from "@/public/wk.png";
import wp from "@/public/wp.png";

// black pieces
import br from "@/public/br.png";
import bn from "@/public/bn.png";
import bb from "@/public/bb.png";
import bq from "@/public/bq.png";
import bk from "@/public/bk.png";
import bp from "@/public/bp.png";
import { useRecoilState } from "recoil";

import { LiveGameState } from "@repo/types";

type PieceWithColor = "wr" | "wn" | "wb" | "wq" | "wk" | "wp" | "br" | "bn" | "bb" | "bq" | "bk" | "bp";

type PieceStore = Record<PieceWithColor, StaticImageData>;

const piece_store:PieceStore = {
    wr: wr,
    wn: wn,
    wb: wb,
    wq: wq,
    wk: wk,
    wp: wp,
    br: br,
    bn: bn,
    bb: bb,
    bq: bq,
    bk: bk,
    bp: bp,
};

const DARK_WHITE = "#b0bec5";
const DARK_BLACK = "#37474f";

const LIGHT_WHITE = "#f0d9b5";
const LIGHT_BLACK = "#b58863";

const DARK_FOCUSED = "#ffeb3b";
const DARK_POSSIBLE = "#4caf50";

const LIGHT_FOCUSED = "#ffeb3b";
const LIGHT_POSSIBLE = "#a1d99b";

const LIGHT_CAPTURE = "#f77f7f";
const DARK_CAPTURE = "#e57373";

type Board = ({
    square: Square;
    type: PieceSymbol;
    color: Color;
} | null)[][];



export default function Board({board,game_id,make_move,color}:{board: Board,game_id: string,make_move:(from: string, to: string) => void,color: "b" | "w"}){

    let [focusedpiece,setFocusedPiece] = useState<HTMLSpanElement | null>(null);
    let [validmove,setValidMoves] = useState<string[] | undefined>(undefined);
    const [orient,setOrient] = useRecoilState(board_orien);

    const board_ref = useRef<HTMLDivElement>(null);
    let square_refs = useRef<Map<string, HTMLSpanElement | null>>(new Map());

    function find_ind(row :number, col :number){
        return row+col;
    }

    function assign_id(row: number, col: number){
        let square: string = "";
        let row_id: string = (8-row).toString();
        let col_id: string = String.fromCharCode(97+col);
        return col_id+row_id;
    }

    function handleClick(e: MouseEvent){
        const id = e.currentTarget.id;
        const square_node = square_refs.current.get(id);

        if(focusedpiece && square_node){
            const from = focusedpiece.id;
            const to = square_node.id;

            //@ts-ignore
            const possible_moves = GameManager.get_instance().get_moves(from);

            if(possible_moves && from !== to){
                make_move(from,to);
            }

            set_reset_color("RESET", validmove ?? []);
            const row = 8-(from.charCodeAt(0)-97);
            const col = 8-(Number.parseInt(from.charAt(1))-1);
            if((row+col) % 2 == 0){
                focusedpiece.style.backgroundColor = DARK_BLACK;
            }
            else{
                focusedpiece.style.backgroundColor = DARK_WHITE;
            }
            setValidMoves(undefined);
            setFocusedPiece(null);
        }

        else if(square_node){
            //@ts-ignore
            const sq: Square = square_node.id;
            const piece_info = GameManager.get_instance().get_piece_info(game_id,sq);
            if(!piece_info || piece_info.color !== color){
                return;
            }

            square_node.style.backgroundColor = "#ffeb3b";
            const possible_moves = GameManager.get_instance().get_moves(game_id,sq);
            console.log(possible_moves);

            setValidMoves(possible_moves);
            setFocusedPiece(square_node);
            set_reset_color("SET",possible_moves);
        }
    }

    function set_reset_color(op: "SET" | "RESET",validmoves: string[]){
        validmoves.forEach((move)=>{
            SQUARES.forEach((sq)=>{
                if(move.includes(sq)){
                    const elem = square_refs.current.get(sq);
                    if(elem){
                        if(op === "SET")
                        {
                            if(move.includes("x"))
                            elem.style.backgroundColor = DARK_CAPTURE;
                            else
                            elem.style.backgroundColor = DARK_POSSIBLE;
                        }
                        else
                        {
                            const row = 8-(sq.charCodeAt(0)-97);
                            const col = 8-(Number.parseInt(sq.charAt(1))-1);
                            if((row+col) % 2 == 0){
                                elem.style.backgroundColor = DARK_BLACK;
                            }
                            else{
                                elem.style.backgroundColor = DARK_WHITE;
                            }
                        }
                    }
                }
            })
        });
    }

    return(
        <div 
        ref={board_ref}
        className={`w-full mt-4 flex ${orient === "w" ? "flex-col" : "flex-col-reverse"}`}>
            {
                board.map((row,row_no)=>{
                    return(
                        <div
                        key={row_no} 
                        className="flex">
                            {
                                row.map((sq,col_no)=>{
                                    return(
                                        <span
                                        key={assign_id(row_no,col_no)}
                                        className="flex flex-row">
                                            {
                                                <span
                                                ref={(el)=>{
                                                    if(el){
                                                        square_refs.current.set(assign_id(row_no,col_no),el);
                                                    }
                                                }}
                                                onClick={handleClick}
                                                id={assign_id(row_no,col_no)}
                                                className = {`${find_ind(row_no,col_no) %2 == 0 ? "dark:bg-[#b0bec5] bg-[#f0d9b5]" : "dark:bg-[#37474f] bg-[#b58863]"} relative  md:h-[100px] md:w-[100px] border-2 h-[80px] w-[80px]`}>
                                                    {
                                                        sq && <Image
                                                        className="absolute"
                                                        loading="lazy"
                                                        //@ts-ignore
                                                        src = {piece_store[(sq.color+sq.type)]} 
                                                        alt={sq.type}/>
                                                    }
                                                </span>
                                            }
                                        </span>
                                    )
                                })
                            }
                        </div>
                    )
                })
            }
        </div>
    )
}
