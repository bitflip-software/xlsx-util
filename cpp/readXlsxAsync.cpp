#include "napi.h"
#include "readXlsxAsync.h"
#include "AsyncReader.h"
#include "AsyncError.h"

namespace xlsx
{
    void readXlsxAsync( const Napi::CallbackInfo& info )
    {
        Napi::Env env = info.Env();
        Napi::HandleScope scope{ env };

        // we need to check for the presence of a client callback function
        // and if we do not have one then we must raise a synchronous error
        if( info.Length() != 4 )
        {
            Napi::TypeError::New(env, "xlsx-util: invalid argument count - should be 4").ThrowAsJavaScriptException();
            return;
        }

        if( !info[3].IsFunction() )
        {
            Napi::TypeError::New(env, "xlsx-util: invalid callback function [arg3]").ThrowAsJavaScriptException();
            return;
        }

        Napi::Function cb = info[3].As<Napi::Function>();

        if( !info[0].IsString() )
        {
            auto err = new AsyncError{ cb, "xlsx-util: first argument must be a string [filename]" };
            err->Queue();
            return;
        }

        if( !info[1].IsBoolean() )
        {
            auto err = new AsyncError{ cb, "xlsx-util: second argument must be a boolean [filename]" };
            err->Queue();
            return;
        }

        Napi::Function transformFun = Napi::Value{ env, env.Null() }.As<Napi::Function>();

        if( !info[2].IsNull() && info[2].IsFunction() )
        {
            transformFun = info[2].As<Napi::Function>();
        }

        const std::string filename = info[0].As<Napi::String>().Utf8Value();
        const bool hasHeaders = info[1].ToBoolean();
        AsyncReader* reader = new AsyncReader{ filename, hasHeaders, transformFun, cb };
        reader->Queue();
    }
}
