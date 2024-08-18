import { Chess, Move } from "chess.js"

type GameState = {
    chess: Chess,
    black: string,
    white: string
}

type GameRecord = Record<string,GameState>;

export class GameManager{
    private game_record: GameRecord;
    private static instance: GameManager;

    private constructor(){
        this.game_record = {};
    }

    static get_instance(){
        if(!GameManager.instance){
            GameManager.instance = new GameManager();
        }

        return GameManager.instance;
    }

    public add_game({game_id, black, white}:{game_id: string, black: string, white: string}){
        const ongoing_game = this.game_record;

        this.game_record = {...ongoing_game,[game_id]:{
            black,
            white,
            chess: new Chess(),
        }}
    }

    public get_game(game_id : string){
        const game = this.game_record[game_id];

        if(game === undefined)
            return undefined;

        return game;
    }

    public remove_game(game_id: string){
        delete this.game_record[game_id];
    }

    public get_board(game_id: string): string | undefined {
        const game = this.game_record[game_id];

        if(game === undefined)
            return undefined;

        return game.chess.fen();
    }

    public clear_board(game_id:string){
        const game = this.game_record[game_id];

        if(game === undefined)
            return;

        game.chess.clear();
    }
}