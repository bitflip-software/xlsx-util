#pragma once
#include <node.h>
#include <xlsxio_read.h>
#include <string>
#include <vector>

namespace xlsx
{
    class XlsxReader
    {
    public:
        XlsxReader( const std::string& inFilename );
        ~XlsxReader();

    public:
        xlsxioreader getReader() const;
        bool getIsOk() const;
        std::vector<std::string> getSheetNames() const;

    private:
        bool myIsOk;
        std::string myFilename;
        xlsxioreader myReader;

    private:
        static int listSheetsCallback( const char* name, void* callbackdata );
        struct SheetNames
        {
            std::vector<std::string> sheets;
        };
    };
}
