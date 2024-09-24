import Connect from "./connect";

export default function HomeLayout({children}:{children: React.ReactNode}){
    return(
        <div>
            <Connect/>
            {children}
        </div>
    )
}