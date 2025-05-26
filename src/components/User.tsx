import imgUser from '@/assets/user.svg';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"


const User = () => {
    return (
        <div className="h-full w-90">
            <div className="flex justify-end pr-10 pt-2">
                <Popover>
                    <PopoverTrigger>
                        <img className="h-15 w-15 border rounded-full cursor-pointer" src={imgUser} />
                    </PopoverTrigger>
                    <PopoverContent>
                        <div className='cursor-pointer hover:bg-primary/20 hover:text-primary p-2'>退出登录</div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}

export default User;
