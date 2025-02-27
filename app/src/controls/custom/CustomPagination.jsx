import React from 'react'
import { Pagination } from 'rsuite'

const ControlPagination = ({isLoading, total, limit, activePage, onChangePage, onChangeLimit}) => {
    return (
        <Pagination
            size={'sm'} prev={true} next={true}
            layout={['-', 'limit', '|', 'pager']}
            first={true}
            last={true}
            ellipsis={false}
            boundaryLinks={false}
            total={total}
            limit={limit}
            limitOptions={[10,20,50,100]}
            maxButtons={5}
            activePage={activePage}
            onChangePage={(offset) => {
                if (isLoading) return
                onChangePage(offset)
            }}
            onChangeLimit={onChangeLimit}
        />
    )
}

export const CustomPagination = ControlPagination