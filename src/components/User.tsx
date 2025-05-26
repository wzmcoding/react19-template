import imgUser from '@/assets/user.svg';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const User = () => {
    return (
        <div className="h-full w-90">
            <div className="flex justify-end pr-10 pt-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <img className="h-15 w-15 border rounded-full cursor-pointer" src={imgUser} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuGroup>
                            <DropdownMenuItem className='cursor-pointer hover:bg-primary/20! hover:text-primary!'>
                                <div>退出登录</div>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

export default User;
