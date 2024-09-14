"use client"

import {z} from "zod";
import { useEffect, useState } from "react";

import { signIn } from "next-auth/react";
import {useForm} from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@repo/ui";
import { Button } from "@repo/ui";
import { Input } from "@repo/ui";
import { Checkbox } from "@repo/ui";

import { user_signup_form_schema } from "@repo/types";
import { create_user, is_username_taken } from "./actions";
import { useRouter } from "next/navigation";

type FormValue = z.output<typeof user_signup_form_schema>;


export default function SignUp(){

    const router = useRouter();

    const [usernametaken, setUsernameTaken] = useState(false);
    const [policy, setPolicy] = useState(false);

    const form_methods = useForm<FormValue>({
        resolver: zodResolver(user_signup_form_schema),
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
                const resp = await signIn<"credentials">("credentials",{
                    ...credentials,
                    redirect: false,
                });

                if(resp && resp.ok)
                    router.push("/home");
            }
        }catch(err){
            form_methods.setError("root",{message: "Could not create user"})
        }
    }
    

    useEffect(()=>{
        if(!isDirty || isSubmitting || isSubmitSuccessful){
            return;
        }

        const is_username_availabe = async() => {
            const is_taken = await is_username_taken(form_methods.getValues("username"));

            setUsernameTaken(is_taken);;
        }

        is_username_availabe();
    })

    return (
        <div className="overflow-hidden rounded-[0.5rem] border bg-background shadow mx-16 mt-8">
            <div className="flex-col items-center justify-center h-[850px] md:grid lg:grid-cols-2 lg:max-w-none lg:px-0">
            <div className="relative h-full hidden flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-zinc-900"></div>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col">
                        <h1 className="text-2xl tracking-tight my-4 font-bold">Create your account</h1>
                        <Form {...form_methods}>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                control={control}
                                name="username"
                                render={({field})=>(
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="johndoe123" {...field}/>
                                        </FormControl>
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
                                            <Input type="password" placeholder="********" {...field}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                                />
                                <div className="items-top flex space-x-2 my-2">
                                    <Checkbox
                                    onClick={()=>setPolicy(!policy)}
                                    id="term1"/>
                                    <label
                                    htmlFor="terms1"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        I agree to privacy policy and cookie usage
                                    </label>
                                </div>
                                <Button
                                className="w-full"
                                disabled={
                                    !isDirty ||
                                    isSubmitting ||
                                    isLoading || 
                                    usernametaken || 
                                    !policy
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