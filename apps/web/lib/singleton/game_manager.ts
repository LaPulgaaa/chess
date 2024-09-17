import { Chess, Move, Square } from "chess.js";

export class GameManager{
    private static instance: GameManager;
    private game: Chess;

    private constructor(fen: string | undefined){
        this.game = new Chess(fen);
    }

    public static get_instance(fen?: string){
        if(!GameManager.instance){
            GameManager.instance = new GameManager(fen);
        }

        return GameManager.instance;
    }

    public make_move(from: string, to :string){
        try{
            this.game.move({
                from,
                to,
            });
            return true;
        }catch(err){
            console.log(err);
            return false;
        }
    }

    public get_board(){
        return this.game.board();
    }

    public get_moves(square: Square){
        return this.game.moves({square});
    }
}