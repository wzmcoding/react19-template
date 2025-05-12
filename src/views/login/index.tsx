import { useState } from "react";
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router";
import { z } from "zod"

import LoginImg from "@/assets/login.png"
import { service } from "@/api";
import { useMutation, useMutationState } from "@tanstack/react-query"


const mutationKey = ['loginData']
const Login = () => {
    const mutation = useMutation({ mutationFn: service.auth.login })
    const data = useMutationState({
        filters: { mutationKey },
        select: (mutation) => mutation.state.data,
    })
    const navigate = useNavigate()

    const formSchema = z.object({
        phone: z.string().nonempty({
            message: "请输入手机号",
        }),
        code: z.string().nonempty({
            message: "请输入验证码",
        }),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            phone: "",
            code: "",
        },
    })

    function handleLogin() {
        form.reset()
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const data = await mutation.mutateAsync(values)
        console.log('登录返回：', data)
        navigate('/')
    }
    return (
        <div className="w-[100vw] h-[100vh] bg-secondary flex justify-center items-center">
            <div className="min-w-216 h-130">
                <div className="w-200 h-120 flex items-center justify-around flex-row p-14 gap-3">
                    <div className="flex-1">
                        <img src={LoginImg} alt="login" className="w-89 h-72.5" />
                    </div>
                    <div className="flex-1 w-full h-full mt-20 flex flex-col gap-8">
                        <div className="font-semibold text-2xl">登录 OI Practice</div>
                        <div>
                            {mutation.error && (
                                <h5 onClick={() => mutation.reset()}>{mutation.error?.message}</h5>
                            )}
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder="请输入手机号" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <FormField
                                                control={form.control}
                                                name="code"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="请输入验证码" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <Button>验证码</Button>
                                    </div>
                                    <Button type="submit" variant="default" className="bg-primary w-80 py-6 text-xl rounded-full">登录</Button>
                                </form>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
