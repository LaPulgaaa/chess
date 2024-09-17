import Board from "./board";

export default function Online(){
    const fen = "rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq - 0 2";
    return(
        <div  className="flex lg:flex-row flex-col items-center lg:justify-around mt-12">
            <Board fen={fen} />
            <div>Display moves</div>
        </div>
    )
}