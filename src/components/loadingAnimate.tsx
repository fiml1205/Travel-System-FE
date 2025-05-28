import {LoaderCircle} from 'lucide-react'

export default function LoadingAnimate () {
    return (
        <div className='layout flex justify-center items-center'>
            <LoaderCircle className='animate-spin w-24 h-24 text-white'/>
        </div>
    )
}