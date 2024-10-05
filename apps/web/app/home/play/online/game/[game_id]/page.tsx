import Board from "../../board";

export default function Game({params}:{params: {game_id: string}}){
    const game_id = params.game_id;
    return (
        <div className="flex lg:flex-row flex-col justify-between m-12 space-x-2">
            <div className="w-full flex flex-col items-center">
                <Board fen=""/>
            </div>
            <div>
                Record moves here
            </div>
        </div>
    )
}