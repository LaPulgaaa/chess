"use client"

import {z} from "zod";
import { useState } from "react";

import { signIn } from "next-auth/react";
import {useForm} from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@repo/ui";
import { Button } from "@repo/ui";
import { Input } from "@repo/ui";

import { user_signin_form_schema } from "@repo/types";
import { create_user } from "./actions";

type FormValue = z.output<typeof user_signin_form_schema>;


export default function SignUp(){

    const [usernametaken, setUsernameTaken] = useState(false);

    const form_methods = useForm<FormValue>({
        resolver: zodResolver(user_signin_form_schema),
        defaultValues: {
            username: "",
            password: "",
            email: "",
        },
        mode: "onChange",
    });

    const {
        handleSubmit,
        control,
        formState:{isDirty, isLoading, isSubmitting, isSubmitSuccessful}
    } = form_methods;

    const onSubmit:SubmitHandler<FormValue> = async (data:FormValue) => {
        try{
            const user = await create_user(data);
            const credentials = {
                email: data.email,
                password: data.password,
            }
            if(user !== null){
                await signIn<"credentials">("credentials",{
                    ...credentials
                })
            }
        }catch(err){
            form_methods.setError("root",{message: "Could not create user"})
        }
    }
    

    // useEffect(()=>{
    //     if(isLoading || isSubmitSuccessful || isSubmitting)
    //         return;

    /*    const is_username_available = async() =>{
        is_username_taken = await is_username_taken(form_state.getValue("username"))
    }
    */
    //     is_username_available();
    // },[isSubmitting, isSubmitSuccessful])

    return (
        <div className="overflow-hidden rounded-[0.5rem] border bg-background shadow mx-16 mt-8">
            <div className="flex-col items-center justify-center h-[800px] md:grid lg:grid-cols-2 lg:max-w-none lg:px-0">
            <div className="relative h-full hidden flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-zinc-900"></div>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl tracking-tight">Create your account</h1>
                        <Form {...form_methods}>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                control={control}
                                name="username"
                                render={({field})=>(
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="johndoe123" {...field}/>
                                        </FormControl>
                                        <FormDescription>This will be your unique identifier</FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={control}
                                name="email"
                                render={({field})=>(
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="johndoe@domain.com" {...field}/>
                                        </FormControl>
                                        <FormDescription>Your email address</FormDescription>
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
                                            <Input type="password" placeholder="**********" {...field}/>
                                        </FormControl>
                                        <FormDescription>Your email address</FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                                />
                                <Button disabled={
                                    !isDirty ||
                                    isSubmitting ||
                                    isLoading || 
                                    usernametaken
                                } type="submit">Create Account</Button>
                            </form>
                        </Form>
                    </div>
                    <div className="grid gap-6">
                        
                    </div>
                </div>
            </div>
            </div>
        </div>
    )
}