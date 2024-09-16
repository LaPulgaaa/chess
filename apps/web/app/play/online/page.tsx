import Board from "./board";


export default function Online(){
    return(
        <div  className="flex justify-around mt-12">
            <Board fen="dummy"/>
            <div>Display moves</div>
        </div>
    )
}