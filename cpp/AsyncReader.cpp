#include "AsyncReader.h"
#include "XlsxReaderFunctions.h"
#include "numtolet.h"
#include <iostream>

namespace xlsx
{
    AsyncReader::AsyncReader(
            const std::string& filename,
            bool hasHeaders,
            std::map<std::string, std::string> transformMap,
            std::set<std::string> deletes,
            bool doPascalCase,
            std::set<std::string> pascalWords,
            std::set<std::string> stringColumns,
            const Napi::Function& callback )
    : Napi::AsyncWorker{ callback }
    , myFilename{ filename }
    , myHasHeaders{ hasHeaders }
    , myTransformMap{ transformMap }
    , myDeletes{ deletes }
    , myDoPascalCase{ doPascalCase }
    , myPascalWords{ pascalWords }
    , myStringColumns{ stringColumns }
    , mySheet{}
    {

    }


    void
    AsyncReader::Execute()
    {
        try
        {
            mySheet = extractAllData( myFilename, myHasHeaders, myTransformMap, myDeletes, myDoPascalCase, myPascalWords, myStringColumns );
        }
        catch( std::exception& ex )
        {
            SetError( ex.what() );
        }
        catch( ... )
        {
            SetError( "xlsx-util: an unknown exception occurred during 'myData = extractAllData( myFilename );'");
        }
    }


    void
    AsyncReader::OnOK()
    {
        try
        {
            Napi::Array arr = Napi::Array::New( Env() );
            const int numRows = mySheet.getNumRows();
            auto headers = mySheet.getHeaders();


            for( int i = 0; i < numRows; ++i )
            {
                const auto row = mySheet.getRow( i );
                Napi::Object obj = Napi::Object::New( Env() );

                int j = 0;
                for( auto cellIter = row.cbegin(); cellIter != row.cend(); ++cellIter, ++j )
                {
                    const auto val = *cellIter;

                    if( j >= mySheet.getHeaders().size() )
                    {
                        throw std::runtime_error( "xlsx-util: something is wrong with the headers") ;
                    }

                    const auto let = mySheet.getHeaders().at( j );

                    if( val.getIsString() )
                    {
                        obj.Set( Napi::String::New( Env(), let ), Napi::String::New( Env(), val.getString() ) );
                    }
                    else if( val.getIsInt() )
                    {
                        obj.Set( Napi::String::New( Env(), let ), Napi::Number::New( Env(), static_cast<double>( val.getInt() ) ) );
                    }
                    else if( val.getIsDouble() )
                    {
                        obj.Set( Napi::String::New( Env(), let ), Napi::Number::New( Env(), val.getDouble() ) );
                    }
                    else
                    {
                        obj.Set( Napi::String::New( Env(), let ), Napi::Value{ Env(), Env().Null() } );
                    }
                }

                arr[i] = obj;
            }
                                                           // error      // result
            Callback().MakeCallback( Receiver().Value(), { Env().Null(), arr } );
        }
        catch( std::exception& e )
        {
            Callback().MakeCallback( Receiver().Value(), { Napi::Error::New( Env(), e.what() ).Value(), Env().Undefined() } );
        }
        catch( ... )
        {
            Callback().MakeCallback( Receiver().Value(), { Napi::Error::New( Env(), "xlsx-util: error occurred during 'OnOK'" ).Value(), Env().Undefined() } );
        }
    }


    void
    AsyncReader::OnError( const Napi::Error& e )
    {
                                                       // error   // result
        Callback().MakeCallback( Receiver().Value(), { e.Value(), Env().Undefined() } );
    }
}
