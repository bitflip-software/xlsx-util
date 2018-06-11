#include "napi.h"
#include "toss.h"
#include "str.h"
#include "xlsx.h"
#include "xlsxio_read.h"

#include <future>

namespace iq
{
    Napi::Array getDataAsync( Napi::Env& env, const std::string& filename )
    {
        auto returnArr = Napi::Array::New( env );
        iq::XlsxReader xreader{ filename };

        if( !xreader.getIsOk() )
        {
            return returnArr;
        }

        const auto sheetNames = xreader.getSheetNames();

        for( int index = 0; index < sheetNames.size(); ++index )
        {
            const auto& name = sheetNames.at( index );
            auto napiString = Napi::String::New( env, name );
            returnArr[index] = napiString;
        }

        return returnArr;
    }


    Napi::Promise getData( const Napi::CallbackInfo& info )
    {
        Napi::Env env = info.Env();

        auto deferred = Napi::Promise::Deferred::New(env);

        if ( info.Length() != 1 )
        {
            deferred.Reject( Napi::TypeError::New( env, "one argument is required: filename").Value() );
            return deferred.Promise();
        }
        else if( !info[0].IsString()  )
        {
            deferred.Reject( Napi::TypeError::New( env, "one string argument is required: filename").Value() );
            return deferred.Promise();
        }

        const auto filename = info[0].ToString().Utf8Value();

        std::future<Napi::Array> fut = std::async( std::launch::async, getDataAsync, std::ref( env ), filename );

        auto returnArr = fut.get();

        if( returnArr.Length() == 0 )
        {
            deferred.Reject( Napi::TypeError::New( env, "xlsx file could not be opened" ).Value() );
            return deferred.Promise();
        }

        deferred.Resolve( returnArr );
        return deferred.Promise();
    }
}

