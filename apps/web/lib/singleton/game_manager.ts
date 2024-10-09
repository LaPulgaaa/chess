import { Chess, Move, Square } from "chess.js";

export class GameManager{
    private static instance: GameManager;
    private games: Map<string,Chess>;

    private constructor(){
        this.games = new Map();
    }

    public static get_instance(){
        if(!GameManager.instance){
            GameManager.instance = new GameManager();
        }

        return GameManager.instance;
    }

    public add_game(game_id: string, fen: string){
        if(this.games.has(game_id))
            return this.games.get(game_id)!.board();

        this.games.set(game_id, new Chess(fen));
        return this.games.get(game_id)!.board();
    }

    public get_game_board(game_id: string){
        if(this.games.has(game_id)){
            const game = this.games.get(game_id)!;
            return game.board();
        }
        return undefined;
    }

    public get_game_fen(game_id: string){
        if(this.games.has(game_id))
        {
            return this.games.get(game_id)!.fen();
        }

        return undefined;
    }

    public make_move(game_id: string, from: string, to: string){

        try{
            if(this.games.has(game_id)){
                let game = this.games.get(game_id)!;
                game.move({
                    from,
                    to,
                });

                return game.board();
            }

            throw new Error("Game does not exists");
        }catch(err){
            console.log(err);
            return undefined;
        }

    }

    public reset_board(game_id: string){
        if(this.games.has(game_id)){
            this.games.get(game_id)!.reset();

            return this.games.get(game_id)!;
        }

        return undefined;
    }

    public get_moves(game_id: string,square: Square){
        if(this.games.has(game_id)){
            return this.games.get(game_id)!.moves({ square });
        }

        return [];
    }

}
