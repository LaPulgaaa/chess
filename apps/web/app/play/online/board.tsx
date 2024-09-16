import Image, { StaticImageData } from "next/image";

import { Chess } from "chess.js";

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

export default function Board({fen}:{fen: string}){
    const chess = new Chess();
    const board = chess.board();

    function find_ind(a:number,b:number){
        return a+b;
    }

    return(
        <div className="">
            {
                board.map((row,row_no)=>{
                    return(
                        <div className="flex">
                            {
                                row.map((sq,col_no)=>{
                                    return(
                                        <span className="flex flex-row">
                                            {
                                                <span 
                                                className = {`${find_ind(row_no,col_no) %2 == 0 ? "bg-[#f0d9b5]" : "bg-[#b58863]"} relative  h-[100px] w-[100px] border-2`}>
                                                    {
                                                        sq && <Image
                                                        className="absolute"
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
