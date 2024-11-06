'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";

import { z } from "zod";
import { signIn } from "next-auth/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { user_signin_form_schema } from "@repo/types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, ToastAction } from "@repo/ui";
import { Input } from "@repo/ui";
import { Button } from "@repo/ui";
import { useToast } from "@repo/ui";

type FormValue = z.output<typeof user_signin_form_schema>;

export default function Login(){

    const router = useRouter();
    const {toast} = useToast();

    const form_methods = useForm<FormValue>({
        resolver: zodResolver(user_signin_form_schema),
        defaultValues: {
            email: "",
            password: "",   
        }
    });

    const onSubmit:SubmitHandler<FormValue> = async (credentials: FormValue) => {
        try{
            const resp = await signIn<"credentials">("credentials",{
                ...credentials,
                redirect: false
            });
    
            if(resp && resp.ok){
                router.push("/home")
            }

            else{
                toast({
                    variant: "destructive",
                    title: "Signin failed!!",
                    description: "Please check your creds.",
                    action: <ToastAction altText="Try Again">Try Again</ToastAction>
                });

            }
        }catch(err){
            console.log(err);
            toast({
                variant: "destructive",
                title: "Error signing in!",
            })
        }
    }

    const {control, handleSubmit, formState:{isDirty, isLoading, isSubmitting}} = form_methods;

    return (
        <div className="overflow-hidden rounded-[0.5rem] border bg-background shadow mx-4 mt-8">
            <div className="flex-col items-center justify-center h-[800px] md:grid lg:grid-cols-2 lg:max-w-none lg:px-0">
            <div className="relative h-full hidden flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-zinc-900"></div>
                <div className="relative z-20 flex items-center text-lg font-medium italic">
                    play/ Chess
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <div className="text-lg">
                        "Once you’re a chess player, you spend a lot of time thinking about the game and you can’t get it completely out of your head."
                        </div>
                        <footer className="text-sm italic">Magnus Carlsen</footer>
                    </blockquote>
                </div>
            </div>
            <div className="mx-auto h-full flex flex-col justify-center w-full sm:w-[350px] space-y-6">
                <div className="w-full py-24 px-8 bg-zinc-900 w-full md:w-[440px] px-4 rounded-md">
                    <div className="flex flex-col space-y-2 text-center mb-4">
                        <h1 className="text-2xl font-semibold tracking-tight">Welcome back!</h1>
                    </div>
                    <div className="flex flex-col ">
                        <div className="">
                        <Form {...form_methods}>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <FormField
                                control={control}
                                name="email"
                                render={({field})=>(
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="johndoe@domain.com" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={control}
                                name="password"
                                render={({field})=>(
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                            type="password"
                                            placeholder="*********" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                                />
                                <Button
                                disabled = {
                                    !isDirty ||
                                    isSubmitting || 
                                    isLoading 
                                } 
                                className="w-full mt-8"
                                type="submit">
                                    Sign in
                                </Button>
                            </form>
                        </Form>
                        </div>
                        <br/>
                        <div className="flex justify-center mt-4 hover:underline underline-offset-2">
                            <Link href={"/signup"}>
                                <p>Don't have an account?</p>
                            </Link>
                        </div>
                    </div>
                    
                </div>
            </div>
            </div>
        </div>
    )
}